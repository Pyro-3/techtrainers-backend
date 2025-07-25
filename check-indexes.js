const mongoose = require('mongoose');

// Simple script to identify duplicate index warnings
console.log('Checking for duplicate indexes...');

// The issue is likely in models that define both:
// 1. index: true in field definition
// 2. schema.index() separately

// Common culprits:
// - timestamp fields with both { index: true } and schema.index({ timestamp: 1 })
// - createdAt/updatedAt with duplicate definitions

console.log('Check your models for:');
console.log('1. Fields with "index: true" that also have schema.index()');
console.log('2. Timestamp fields with duplicate index definitions');
console.log('3. createdAt/updatedAt fields with conflicting indexes');

process.exit(0);
