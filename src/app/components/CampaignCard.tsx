import { client } from "@/app/client";
import Link from "next/link";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";

type CampaignCardProps = {
    campaignAddress: string;
};

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaignAddress }) => {
    const contract = getContract({
        client: client,
        chain: sepolia,
        address: campaignAddress,
    });

    // Get Campaign Name
    const { data: campaignName } = useReadContract({
        contract: contract,
        method: "function name() view returns (string)",
        params: [],
    });

    // Get Campaign Description
    const { data: campaignDescription } = useReadContract({
        contract: contract,
        method: "function description() view returns (string)",
        params: [],
    });

    // Goal amount of the campaign
    const { data: goal, isLoading: isLoadingGoal } = useReadContract({
        contract: contract,
        method: "function goal() view returns (uint256)",
        params: [],
    });

    // Total funded balance of the campaign
    const { data: balance, isLoading: isLoadingBalance } = useReadContract({
        contract: contract,
        method: "function getContractBalance() view returns (uint256)",
        params: [],
    });

    // Get Image URL
    const { data: imageUrl, isPending: isImageLoading } = useReadContract({
        contract: contract,
        method: "function imageUrls(uint256) view returns (string)",
        params: [BigInt(0)], // Assuming the first image
    });

    // Calculate the total funded balance percentage
    const totalBalance = balance?.toString();
    const totalGoal = goal?.toString();
    let balancePercentage =
        (parseInt(totalBalance as string) / parseInt(totalGoal as string)) * 100;

    // If balance is greater than or equal to goal, percentage should be 100
    if (balancePercentage >= 100) {
        balancePercentage = 100;
    }

    return (
        <div className="flex flex-col justify-between max-w-sm p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hover:shadow-xl dark:shadow-slate-700 transition-shadow duration-300">
            <div>
                {/* Image Section */}
                {isImageLoading ? (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                ) : (
                    <img
                        src={imageUrl || "https://via.placeholder.com/400"}
                        alt="Campaign"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                )}

                {/* Progress Bar */}
                {!isLoadingBalance && (
                    <div className="mb-4">
                        <div className="relative w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
                            <div
                                className="h-6 bg-blue-600 rounded-full dark:bg-blue-500"
                                style={{ width: `${balancePercentage}%` }}
                            >
                                <p className="text-white text-xs p-1">
                                    ${balance?.toString()}
                                </p>
                            </div>
                            <p className="absolute top-0 right-0 text-gray-800 dark:text-white text-xs p-1">
                                {balancePercentage >= 100
                                    ? "Goal Reached!"
                                    : `${Math.round(balancePercentage)}%`}
                            </p>
                        </div>
                    </div>
                )}

                {/* Campaign Name */}
                <h5 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                    {campaignName || "Loading..."}
                </h5>

                {/* Campaign Description */}
                <p className="mb-3 font-normal text-gray-700 dark:text-slate-300">
                    {campaignDescription
                        ? campaignDescription.length > 100
                            ? `${campaignDescription.slice(0, 100)}...`
                            : campaignDescription
                        : "No description available"}
                </p>
            </div>

            {/* View Campaign Button */}
            <Link href={`/campaign/${campaignAddress}`} passHref>
                <p className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 dark:bg-blue-600 rounded-lg hover:bg-blue-800 dark:hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-200 transform hover:scale-105">
                    View Campaign
                    <svg
                        className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M1 5h12m0 0L9 1m4 4L9 9"
                        />
                    </svg>
                </p>
            </Link>
        </div>
    );
};