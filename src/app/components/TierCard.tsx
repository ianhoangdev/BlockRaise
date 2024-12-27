import { prepareContractCall, ThirdwebContract } from "thirdweb";
import { TransactionButton } from "thirdweb/react";

type Tier = {
    name: string;
    amount: bigint;
    backers: bigint;
};

type TierCardProps = {
    tier: Tier;
    index: number;
    contract: ThirdwebContract;
    isEditing: boolean;
};

export const TierCard: React.FC<TierCardProps> = ({ tier, index, contract, isEditing }) => {
    return (
        <div className="max-w-sm p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg hover:shadow-xl dark:shadow-slate-700 transition-shadow duration-300">
            <div className="flex flex-col justify-between">
                {/* Tier Information */}
                <div className="flex justify-between items-center mb-4">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{tier.name}</p>
                    <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">${tier.amount.toString()}</p>
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    Total Backers: {tier.backers.toString()}
                </p>

                {/* Fund Button */}
                <div className="mt-4">
                    <TransactionButton
                        transaction={() =>
                            prepareContractCall({
                                contract: contract,
                                method: "function fund(uint256 _tierIndex) payable",
                                params: [BigInt(index)],
                                value: tier.amount,
                            })
                        }
                        onError={(error) => alert(`Error: ${error.message}`)}
                        onTransactionConfirmed={async () => alert("Funded successfully!")}
                        style={{
                            backgroundColor: "#2563EB",
                            color: "white",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "0.375rem",
                            width: "100%",
                        }}
                        className="transition-all duration-200 transform hover:scale-105 hover:bg-blue-800 focus:outline-none dark:hover:bg-blue-700"
                    >
                        Select Tier
                    </TransactionButton>
                </div>

                {/* Editing Mode */}
                {isEditing && (
                    <div className="mt-4">
                        <TransactionButton
                            transaction={() =>
                                prepareContractCall({
                                    contract: contract,
                                    method: "function removeTier(uint256 _index)",
                                    params: [BigInt(index)],
                                })
                            }
                            onError={(error) => alert(`Error: ${error.message}`)}
                            onTransactionConfirmed={async () => alert("Removed successfully!")}
                            style={{
                                backgroundColor: "red",
                                color: "white",
                                padding: "0.75rem 1.5rem",
                                borderRadius: "0.375rem",
                                width: "100%",
                            }}
                            className="transition-all duration-200 transform hover:scale-105 hover:bg-red-700 focus:outline-none dark:hover:bg-red-600"
                        >
                            Remove Tier
                        </TransactionButton>
                    </div>
                )}
            </div>
        </div>
    );
};