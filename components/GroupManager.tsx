'use client';

import { useState } from 'react';
import { createGroup, joinGroup, leaveGroup } from '../app/group-actions';

export default function GroupManager({ userId, userGroups, allGroups }: any) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userGroupIds = userGroups.map((gm: any) => gm.groupId);
  const availableGroups = allGroups.filter((g: any) => !userGroupIds.includes(g.id));

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createGroup({ name: groupName, createdById: userId });
      setGroupName('');
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await joinGroup({ groupId: selectedGroupId, userId });
      setSelectedGroupId('');
      setShowJoinForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    
    setError('');
    setLoading(true);

    try {
      await leaveGroup({ groupId, userId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Groups</h2>

        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {userGroups.length > 0 ? (
          <div className="space-y-3">
            {userGroups.map((groupMember: any) => (
              <div
                key={groupMember.groupId}
                className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">{groupMember.group.name}</p>
                  <p className="text-sm text-gray-500">
                    {groupMember.group.members.length} member{groupMember.group.members.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleLeaveGroup(groupMember.groupId)}
                  disabled={loading}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded text-sm transition"
                >
                  Leave
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">You haven't joined any groups yet.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create Group */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Group</h3>
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
            >
              + Create Group
            </button>
          ) : (
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Join Group */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Join Existing Group</h3>
          {!showJoinForm ? (
            <button
              onClick={() => setShowJoinForm(true)}
              disabled={availableGroups.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
            >
              {availableGroups.length > 0 ? '+ Join Group' : 'No groups available'}
            </button>
          ) : (
            <form onSubmit={handleJoinGroup} className="space-y-3">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a group</option>
                {availableGroups.map((group: any) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !selectedGroupId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                >
                  {loading ? 'Joining...' : 'Join'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinForm(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
