'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function GroupSelector({ userGroups, activeGroupId }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set('group', groupId);
    router.push(`/?${params.toString()}`);
  };

  if (userGroups.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-8">
      <label className="text-sm font-semibold text-gray-700 mr-3">
        Switch Group:
      </label>
      <select
        value={activeGroupId || ''}
        onChange={handleGroupChange}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 font-medium"
      >
        {userGroups.map((groupMember: any) => (
          <option key={groupMember.groupId} value={groupMember.groupId}>
            {groupMember.group.name}
          </option>
        ))}
      </select>
    </div>
  );
}
