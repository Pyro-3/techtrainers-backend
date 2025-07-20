import React, { useEffect, useState } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'member' | 'trainer' | 'admin';
  isApproved?: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleApproval = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PATCH',
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isApproved: !u.isApproved } : u
        )
      );
    } catch (err) {
      console.error('Failed to toggle approval:', err);
    }
  };

  return (
    <div>
      {loading ? (
        <p className="text-stone-600">Loading users...</p>
      ) : (
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-stone-100 text-left text-sm font-medium text-stone-600">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Approved</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-stone-200 text-stone-800">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4 capitalize">{user.role}</td>
                <td className="p-4">{user.isApproved ? '✅' : '❌'}</td>
                <td className="p-4">
                  {user.role === 'trainer' && (
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={() => toggleApproval(user._id)}
                    >
                      {user.isApproved ? 'Revoke' : 'Approve'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;
