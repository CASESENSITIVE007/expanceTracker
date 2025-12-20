'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createGroup, joinGroupByCode, leaveGroup } from '../app/group-actions';
import GroupSelector from './GroupSelector';

export default function GroupManager({ userId, userGroups, activeGroupId }: any) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdGroupCode, setCreatedGroupCode] = useState('');
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

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
          setTimeout(() => setCreatedGroupCode(''), 4000);
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
    setDeletingGroupId(groupId);

    try {
      await leaveGroup({ groupId, userId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave group');
      setDeletingGroupId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* My Groups Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 p-6 rounded-2xl shadow-lg border-2 border-blue-500"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-white">
            My Groups
          </h2>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {userGroups.length}
          </span>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 mb-4 bg-red-900 border-2 border-red-500 rounded-lg text-red-200 text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        {userGroups.length > 0 ? (
          <motion.div className="space-y-3">
            <AnimatePresence>
              {userGroups.map((groupMember: any, index: number) => (
                <motion.div
                  key={groupMember.groupId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-bold text-gray-800 text-lg">{groupMember.group.name}</p>
                      {groupMember.group.joinCode && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-1"
                        >
                          <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full font-mono font-bold shadow-md">
                            {groupMember.group.joinCode}
                          </span>
                        
                        </motion.div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      👥 {groupMember.group.members.length} member{groupMember.group.members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLeaveGroup(groupMember.groupId)}
                    disabled={loading || deletingGroupId === groupMember.groupId}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-all shadow-md"
                  >
                    {deletingGroupId === groupMember.groupId ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Leaving...
                      </span>
                    ) : (
                      'Leave'
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-gray-400 italic text-lg">You haven't joined any groups yet.</p>
            <p className="text-gray-400 text-sm mt-2">Create one or ask someone to share an invite code!</p>
          </motion.div>
        )}
      </motion.div>

      {/* Create & Join & Switch Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-900 p-6 rounded-2xl shadow-lg border-2 border-green-500"
        >
          <h3 className="text-xl font-bold mb-4 text-green-400">Create New Group</h3>
          {!showCreateForm ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md"
            >
              + Create Group
            </motion.button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateGroup}
              className="space-y-3"
            >
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-3 border-2 border-green-600 rounded-lg focus:outline-none focus:border-green-400 bg-gray-800 text-gray-100 placeholder-gray-400"
                required
              />
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 rounded-lg transition-all"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Creating...
                    </span>
                  ) : (
                    'Create'
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setError('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 rounded-lg transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Show created group code */}
          <AnimatePresence>
            {createdGroupCode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-green-100 border-2 border-green-300 rounded-xl text-center"
              >
                <p className="text-sm text-gray-700 mb-2 font-semibold">Group created! Share this code:</p>
                <p className="text-3xl font-black text-green-600 mb-3 tracking-widest">{createdGroupCode}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigator.clipboard.writeText(createdGroupCode);
                    alert('Code copied to clipboard!');
                  }}
                  className="w-full text-sm bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                >
                  📋 Copy Code
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Join Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-900 p-6 rounded-2xl shadow-lg border-2 border-purple-500"
        >
          <h3 className="text-xl font-bold mb-4 text-purple-400">Join Group</h3>
          {!showJoinForm ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowJoinForm(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all shadow-md"
            >
              + Join Group
            </motion.button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleJoinGroup}
              className="space-y-3"
            >
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-char code"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-purple-600 rounded-lg focus:outline-none focus:border-purple-400 bg-gray-800 text-gray-100 placeholder-gray-400 text-center text-2xl font-bold tracking-widest"
                required
              />
              <p className="text-xs text-gray-500 text-center font-medium">
                Ask group creator for the invite code
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || joinCode.length < 6}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 rounded-lg transition-all"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Joining...
                    </span>
                  ) : (
                    'Join'
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setShowJoinForm(false);
                    setError('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 rounded-lg transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.form>
          )}
        </motion.div>

        {/* Switch Group - only show if user has multiple groups */}
        {userGroups.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full"
          >
            <GroupSelector userGroups={userGroups} activeGroupId={activeGroupId} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
