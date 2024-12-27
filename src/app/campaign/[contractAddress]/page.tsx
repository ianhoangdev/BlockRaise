'use client';

import { client } from "@/app/client";
import { TierCard } from "../../components/TierCard";
import { useState } from "react";
import { getContract, prepareContractCall, ThirdwebContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { lightTheme, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import * as AWS from "aws-sdk";

export default function CampaignPage({ params }: { params: { contractAddress: string } }) {
  const account = useActiveAccount();
  const { contractAddress: campaignAddress } = params;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const contract = getContract({
    client: client,
    chain: sepolia,
    address: campaignAddress as string,
  });

  // Read contract data
  const { data: name, isLoading: isLoadingName } = useReadContract({ contract, method: "function name() view returns (string)", params: [] });
  const { data: description } = useReadContract({ contract, method: "function description() view returns (string)", params: [] });
  const { data: deadline, isLoading: isLoadingDeadline } = useReadContract({ contract, method: "function deadline() view returns (uint256)", params: [] });
  const deadlineDate = new Date(parseInt(deadline?.toString() as string) * 1000);
  const hasDeadlinePassed = deadlineDate < new Date();
  const { data: goal, isLoading: isLoadingGoal } = useReadContract({ contract, method: "function goal() view returns (uint256)", params: [] });
  const { data: balance, isLoading: isLoadingBalance } = useReadContract({ contract, method: "function getContractBalance() view returns (uint256)", params: [] });
  const { data: tiers, isLoading: isLoadingTiers } = useReadContract({ contract, method: "function getTiers() view returns ((string name, uint256 amount, uint256 backers)[])", params: [] });
  const { data: owner, isLoading: isLoadingOwner } = useReadContract({ contract, method: "function owner() view returns (address)", params: [] });
  const { data: status } = useReadContract({ contract, method: "function state() view returns (uint8)", params: [] });
  const { data: imageUrl, isPending: isImageLoading } = useReadContract({
    contract: contract,
    method: "function imageUrls(uint256) view returns (string)",
    params: [BigInt(0)], // Assuming the first image
  });

  // Calculate balance percentage
  const totalBalance = balance?.toString();
  const totalGoal = goal?.toString();
  let balancePercentage = (parseInt(totalBalance as string) / parseInt(totalGoal as string)) * 100;
  balancePercentage = balancePercentage >= 100 ? 100 : balancePercentage;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
      {/* Campaign Header Section */}
      <div className="flex justify-between items-center mb-4">
        {!isLoadingName ? (
          <h1 className="text-4xl font-semibold text-gray-800 dark:text-white">{name}</h1>
        ) : (
          <div className="w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse h-8" />
        )}
        {owner === account?.address && (
          <div className="flex items-center space-x-4">
            {isEditing && (
              <p className="px-4 py-2 bg-gray-500 text-white rounded-md">
                Status:{" "}
                {status === 0 ? "Active" : status === 1 ? "Successful" : status === 2 ? "Failed" : "Unknown"}
              </p>
            )}
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Done" : "Edit"}
            </button>
          </div>
        )}
      </div>

      {/* Campaign Image Section */}
      <section className="mb-6">
        {isImageLoading ? (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse h-48" />
        ) : (
          <img
            src={imageUrl || "https://via.placeholder.com/400"}
            alt="Campaign Image"
            className="w-1/2 mx-auto h-auto rounded-md shadow-lg"
          />
        )}
      </section>

      {/* Description */}
      <section className="my-6">
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Description:</p>
        <p className="text-gray-600 dark:text-gray-400">{description || "Loading description..."}</p>
      </section>

      {/* Deadline */}
      <section className="mb-6">
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Deadline:</p>
        {!isLoadingDeadline ? (
          <p className="text-gray-600 dark:text-gray-400">{deadlineDate.toDateString()}</p>
        ) : (
          <div className="w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse h-6" />
        )}
      </section>

      {/* Goal Progress */}
      {!isLoadingBalance && (
        <section className="mb-6">
          <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Campaign Goal: ${goal?.toString()}</p>
          <div className="relative w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="h-6 bg-blue-600 dark:bg-blue-500 rounded-full text-right"
              style={{ width: `${balancePercentage}%` }}
            >
              <p className="text-white text-xs p-1">${balance?.toString()}</p>
            </div>
            <p className="absolute top-0 right-0 text-white text-xs p-1">
              {balancePercentage >= 100 ? "" : `${balancePercentage.toFixed(1)}%`}
            </p>
          </div>
        </section>
      )}

      {/* Tiers */}
      <section>
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Tiers:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingTiers ? (
            <p>Loading tiers...</p>
          ) : (
            tiers && tiers.length > 0 ? (
              tiers.map((tier, index) => (
                <TierCard key={index} tier={tier} index={index} contract={contract} isEditing={isEditing} />
              ))
            ) : (
              !isEditing && <p>No tiers available</p>
            )
          )}

          {isEditing && (
            <button
              className="w-full flex flex-col items-center justify-center p-6 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700"
              onClick={() => setIsModalOpen(true)}
            >
              + Add Tier
            </button>
          )}
        </div>
      </section>

      {/* Create Tier Modal */}
      {isModalOpen && <CreateCampaignModal setIsModalOpen={setIsModalOpen} contract={contract} />}
    </div>
  );
}

type CreateTierModalProps = {
  setIsModalOpen: (value: boolean) => void;
  contract: ThirdwebContract;
};

const CreateCampaignModal = ({ setIsModalOpen, contract }: CreateTierModalProps) => {
  const [tierName, setTierName] = useState<string>("");
  const [tierAmount, setTierAmount] = useState<bigint>(1n);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-md">
      <div className="w-11/12 sm:w-1/2 bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-semibold text-gray-800 dark:text-white">Create a Funding Tier</p>
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-md"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
        </div>
        <div className="space-y-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Tier Name:</label>
          <input
            type="text"
            value={tierName}
            onChange={(e) => setTierName(e.target.value)}
            placeholder="Enter tier name"
            className="w-full px-4 py-2 bg-gray-100 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Tier Cost:</label>
          <input
            type="number"
            value={parseInt(tierAmount.toString())}
            onChange={(e) => setTierAmount(BigInt(e.target.value))}
            className="w-full px-4 py-2 bg-gray-100 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <TransactionButton
            transaction={() =>
              prepareContractCall({
                contract,
                method: "function addTier(string _name, uint256 _amount)",
                params: [tierName, tierAmount],
              })
            }
            onTransactionConfirmed={() => {
              alert("Tier added successfully!");
              setIsModalOpen(false);
            }}
            onError={(error) => alert(`Error: ${error.message}`)}
            theme={lightTheme()}
          >
            Add Tier
          </TransactionButton>
        </div>
      </div>
    </div>
  );
};