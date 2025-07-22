const axios = require('axios');
const msal = require('@azure/msal-node');
const { v4: uuidv4 } = require('uuid');

/**
 * Microsoft Teams Meeting Service
 * Handles creation and management of Teams meetings
 */

// Check if Microsoft Teams integration is configured
const isTeamsConfigured = process.env.MS_CLIENT_ID && 
                          process.env.MS_TENANT_ID && 
                          process.env.MS_CLIENT_SECRET;

if (!isTeamsConfigured) {
  console.warn('⚠️ Microsoft Teams credentials not found. Teams meeting features will be disabled.');
  console.warn('Please set MS_CLIENT_ID, MS_TENANT_ID, and MS_CLIENT_SECRET environment variables to enable Teams integration.');
}

// Azure AD app configuration
const msalConfig = {
  auth: {
    clientId: process.env.MS_CLIENT_ID || 'placeholder',
    authority: `https://login.microsoftonline.com/${process.env.MS_TENANT_ID || 'placeholder'}`,
    clientSecret: process.env.MS_CLIENT_SECRET || 'placeholder'
  }
};

// Initialize MSAL application only if configured
let cca = null;
if (isTeamsConfigured) {
  try {
    cca = new msal.ConfidentialClientApplication(msalConfig);
  } catch (error) {
    console.error('❌ Failed to initialize Microsoft Teams integration:', error.message);
  }
}

/**
 * Get access token for Microsoft Graph API
 * @returns {Promise<string>} Access token
 */
const getAccessToken = async () => {
  if (!isTeamsConfigured || !cca) {
    throw new Error('Microsoft Teams integration is not configured');
  }

  try {
    const tokenRequest = {
      scopes: ['https://graph.microsoft.com/.default']
    };
    
    const response = await cca.acquireTokenByClientCredential(tokenRequest);
    return response.accessToken;
  } catch (error) {
    console.error('Error getting MS access token:', error);
    throw new Error('Failed to authenticate with Microsoft services');
  }
};

/**
 * Create a Microsoft Teams meeting
 * @param {Object} meetingDetails - Meeting details
 * @returns {Promise<Object>} Meeting information including join link
 */
const createMSTeamsMeeting = async (meetingDetails) => {
  try {
    // Get access token
    const accessToken = await getAccessToken();
    
    // Service user (app) email from environment variable
    const organizerEmail = process.env.MS_SERVICE_ACCOUNT_EMAIL;
    
    // Format attendees for Graph API
    const attendees = meetingDetails.attendees.map(attendee => ({
      emailAddress: {
        address: attendee.email,
        name: attendee.name
      },
      type: "required"
    }));
    
    // Create meeting request payload
    const meetingRequest = {
      subject: meetingDetails.subject,
      body: {
        contentType: "HTML",
        content: meetingDetails.content || "Online fitness training session"
      },
      start: {
        dateTime: meetingDetails.startTime.toISOString(),
        timeZone: "UTC"
      },
      end: {
        dateTime: meetingDetails.endTime.toISOString(),
        timeZone: "UTC"
      },
      location: {
        displayName: "Microsoft Teams Meeting"
      },
      attendees: attendees,
      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness"
    };
    
    // Call Microsoft Graph API to create meeting
    const response = await axios.post(
      `https://graph.microsoft.com/v1.0/users/${organizerEmail}/calendar/events`,
      meetingRequest,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Return relevant meeting details
    return {
      id: response.data.id,
      subject: response.data.subject,
      startTime: response.data.start.dateTime,
      endTime: response.data.end.dateTime,
      joinLink: response.data.onlineMeeting.joinUrl,
      creationDateTime: response.data.createdDateTime
    };
  } catch (error) {
    console.error('Failed to create Teams meeting:', error.response?.data || error.message);
    throw new Error('Failed to create Teams meeting');
  }
};

/**
 * Update an existing Microsoft Teams meeting
 * @param {Object} updateDetails - Meeting update details
 * @returns {Promise<Object>} Updated meeting information
 */
const updateMSTeamsMeeting = async (updateDetails) => {
  try {
    // Get access token
    const accessToken = await getAccessToken();
    
    // Service user (app) email from environment variable
    const organizerEmail = process.env.MS_SERVICE_ACCOUNT_EMAIL;
    
    // Create update request payload
    const updateRequest = {
      start: {
        dateTime: updateDetails.startTime.toISOString(),
        timeZone: "UTC"
      },
      end: {
        dateTime: updateDetails.endTime.toISOString(),
        timeZone: "UTC"
      }
    };
    
    // Call Microsoft Graph API to update meeting
    const response = await axios.patch(
      `https://graph.microsoft.com/v1.0/users/${organizerEmail}/calendar/events/${updateDetails.meetingId}`,
      updateRequest,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      id: response.data.id,
      subject: response.data.subject,
      startTime: response.data.start.dateTime,
      endTime: response.data.end.dateTime,
      joinLink: response.data.onlineMeeting.joinUrl
    };
  } catch (error) {
    console.error('Failed to update Teams meeting:', error.response?.data || error.message);
    throw new Error('Failed to update Teams meeting');
  }
};

/**
 * Cancel a Microsoft Teams meeting
 * @param {string} meetingId - Meeting ID
 * @returns {Promise<void>}
 */
const cancelMSTeamsMeeting = async (meetingId) => {
  try {
    // Get access token
    const accessToken = await getAccessToken();
    
    // Service user (app) email from environment variable
    const organizerEmail = process.env.MS_SERVICE_ACCOUNT_EMAIL;
    
    // Call Microsoft Graph API to delete meeting
    await axios.delete(
      `https://graph.microsoft.com/v1.0/users/${organizerEmail}/calendar/events/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    return { success: true };
  } catch (error) {
    console.error('Failed to cancel Teams meeting:', error.response?.data || error.message);
    throw new Error('Failed to cancel Teams meeting');
  }
};

module.exports = {
  createMSTeamsMeeting,
  updateMSTeamsMeeting,
  cancelMSTeamsMeeting
};