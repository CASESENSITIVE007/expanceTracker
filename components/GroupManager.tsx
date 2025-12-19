'use client';

import { useState } from 'react';
import { createGroup, joinGroupByCode, leaveGroup } from '../app/group-actions';

export default function GroupManager({ userId, userGroups }: any) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdGroupCode, setCreatedGroupCode] = useState('');

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await createGroup({ name: groupName, createdById: userId });
      if (result.success) {
        setGroupName('');
        setShowCreateForm(false);
        if (result.joinCode) {
          setCreatedGroupCode(result.joinCode);
          // Show code for 3 seconds then hide
          setTimeout(() => setCreatedGroupCode(''), 3000);
        }
      } else {
        setError(result.error || 'Failed to create group');
      }
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
      const result = await joinGroupByCode({ joinCode, userId });
      if (result.success) {
        setJoinCode('');
        setShowJoinForm(false);
        alert(`Successfully joined ${result.groupName}!`);
      } else {
        setError(result.error || 'Failed to join group');
      }
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
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-800">{groupMember.group.name}</p>
                    {groupMember.group.joinCode && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded font-mono font-bold">
                          {groupMember.group.joinCode}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(groupMember.group.joinCode);
                            alert('Code copied!');
                          }}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 rounded transition"
                          title="Copy code"
                        >
                          📋
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
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
          
          {/* Show created group code */}
          {createdGroupCode && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Share this code with friends to join:</p>
              <p className="text-2xl font-bold text-green-600 text-center">{createdGroupCode}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdGroupCode);
                  alert('Code copied to clipboard!');
                }}
                className="w-full mt-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 py-1 rounded transition"
              >
                Copy Code
              </button>
            </div>
          )}
        </div>

        {/* Join Group */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Join Group</h3>
          {!showJoinForm ? (
            <button
              onClick={() => setShowJoinForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              + Join Group
            </button>
          ) : (
            <form onSubmit={handleJoinGroup} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter join code"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-semibold tracking-widest"
                required
              />
              <p className="text-xs text-gray-500 text-center">
                Ask group creator for the 6-character code
              </p>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || joinCode.length < 6}
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
