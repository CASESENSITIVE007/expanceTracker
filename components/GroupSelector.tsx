'use client';

import { useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Define the interface for better TS support
interface GroupMember {
  groupId: string;
  group: {
    name: string;
  };
}

export default function GroupSelector({ 
  userGroups, 
  activeGroupId 
}: { 
  userGroups: GroupMember[], 
  activeGroupId: string 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('group', groupId);
    
    startTransition(() => {
      // Navigates to the same page with the new ?group=ID parameter
      router.push(`/?${params.toString()}`);
    });
  };

  if (!userGroups || userGroups.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 p-6 rounded-2xl shadow-lg border-2 border-purple-500 flex flex-col justify-center min-h-[160px]"
    >
      <h3 className="text-xl font-bold mb-4 text-purple-400">Current Group</h3>
      <div className="relative">
        <select
          value={activeGroupId}
          onChange={handleGroupChange}
          disabled={isPending}
          className={`w-full px-5 py-3 border-2 rounded-lg bg-gray-800 text-gray-100 font-bold transition-all appearance-none cursor-pointer ${
            isPending ? 'border-yellow-500 opacity-50' : 'border-purple-500'
          }`}
        >
          {userGroups.map((member) => (
            <option key={member.groupId} value={member.groupId}>
              {member.group.name}
            </option>
          ))}
        </select>
        
        {/* Loading Overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center rounded-lg backdrop-blur-[2px]">
             <span className="animate-spin mr-2">⏳</span>
             <span className="text-sm font-bold">Switching...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
