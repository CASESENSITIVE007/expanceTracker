'use client';

import { useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function GroupSelector({ userGroups, activeGroupId }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set('group', groupId);
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  if (userGroups.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 p-6 rounded-2xl shadow-lg border-2 border-purple-500 relative flex flex-col justify-center h-full"
    >
      <h3 className="text-xl font-bold mb-4 text-purple-400">Switch Group</h3>
      <div className="relative flex-1 flex flex-col justify-center">
        <motion.select
          value={activeGroupId || ''}
          onChange={handleGroupChange}
          disabled={isPending}
          whileFocus={{ scale: 1.02 }}
          className={`w-full px-5 py-3 border-2 rounded-lg focus:outline-none bg-gray-800 text-gray-100 font-bold transition-all cursor-pointer shadow-md hover:shadow-lg ${
            isPending
              ? 'border-yellow-500 opacity-50 cursor-wait'
              : 'border-purple-500 focus:border-purple-400'
          }`}
        >
          {userGroups.map((groupMember: any) => (
            <option key={groupMember.groupId} value={groupMember.groupId}>
              {groupMember.group.name}
            </option>
          ))}
        </motion.select>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gray-800 bg-opacity-50 rounded-lg flex items-center justify-center backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-2xl"
              >
                ⏳
              </motion.span>
              <span className="text-gray-200 font-bold">Loading...</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
