import { client } from "@/app/client";
import Link from "next/link";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";

type MyCampaignCardProps = {
    contractAddress: string;
};

export const MyCampaignCard: React.FC<MyCampaignCardProps> = ({ contractAddress }) => {
    const contract = getContract({
        client: client,
        chain: sepolia,
        address: contractAddress,
    });

    // Get Campaign Name
    const { data: name } = useReadContract({
        contract,
        method: "function name() view returns (string)",
        params: []
    });

    // Get Campaign Description
    const { data: description } = useReadContract({
        contract,
        method: "function description() view returns (string)",
        params: []
    });

    // Goal Amount of the Campaign
    const { data: goal, isLoading: isLoadingGoal } = useReadContract({
        contract,
        method: "function goal() view returns (uint256)",
        params: []
    });

    // Total funded balance of the campaign
    const { data: balance, isLoading: isLoadingBalance } = useReadContract({
        contract,
        method: "function getContractBalance() view returns (uint256)",
        params: []
    });

    // Image URL
    const { data: imageUrl, isPending: isImageLoading } = useReadContract({
        contract: contract,
        method: "function imageUrls(uint256) view returns (string)",
        params: [BigInt(0)], // Assuming the first image
    });

    // Calculate Progress Percentage
    const totalBalance = balance?.toString();
    const totalGoal = goal?.toString();
    let balancePercentage =
        totalBalance && totalGoal ? (parseInt(totalBalance) / parseInt(totalGoal)) * 100 : 0;

    if (balancePercentage >= 100) {
        balancePercentage = 100;
    }

    return (
        <div className="flex flex-col justify-between max-w-sm p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hover:shadow-xl dark:shadow-slate-700 transition-shadow duration-300">
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
                            <p className="text-white text-xs p-1">{`$${balance?.toString()}`}</p>
                        </div>
                        <p className="absolute top-0 right-0 text-gray-800 dark:text-white text-xs p-1">
                            {balancePercentage >= 100 ? "Goal Reached!" : `${Math.round(balancePercentage)}%`}
                        </p>
                    </div>
                </div>
            )}

            {/* <div>
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
                    {name || "Loading..."}
                </h5>
                <p className="mb-3 text-gray-700 dark:text-slate-300 text-sm font-light">
                    {description || "Loading description..."}
                </p>
            </div> */}

                <h5 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                    {name || "Loading..."}
                </h5>

                {/* Campaign Description */}
                <p className="mb-3 font-normal text-gray-700 dark:text-slate-300">
                    {description
                        ? description.length > 100
                            ? `${description.slice(0, 100)}...`
                            : description
                        : "No description available"}
                </p>

            {/* View Campaign Button */}
            <Link href={`/campaign/${contractAddress}`} passHref={true}>
                <p className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-500 transition-colors duration-200">
                    View Campaign
                    <svg
                        className="rtl:rotate-180 w-3.5 h-3.5 ml-2"
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