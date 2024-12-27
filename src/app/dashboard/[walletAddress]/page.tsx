'use client';
import { client } from "@/app/client";
import { MyCampaignCard } from "../../components/MyCampaignCard";
import { useState } from "react";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { deployPublishedContract } from "thirdweb/deploys";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import * as AWS from "aws-sdk";
require('dotenv').config();

export default function DashboardPage() {
    const account = useActiveAccount();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const CROWDFUNDING_FACTORY = process.env.NEXT_PUBLIC_CROWDFUNDING_FACTORY;

    if (!CROWDFUNDING_FACTORY) {
        throw new Error("CROWDFUNDING_FACTORY environment variable is not set");
    }
    
    const contract = getContract({
        client: client,
        chain: sepolia,
        address: CROWDFUNDING_FACTORY,
    });

    // Get Campaigns
    const { data: myCampaigns, isLoading: isLoadingMyCampaigns, refetch } = useReadContract({
        contract: contract,
        method: "function getUserCampaigns(address _user) view returns ((address campaignAddress, address owner, string name, uint256 creationTime)[])",
        params: [account?.address as string]
    });

    return (
        <div className="mx-auto max-w-7xl px-6 mt-16 sm:px-6 lg:px-8">
            <div className="flex flex-row justify-between items-center mb-8">
                <p className="text-4xl font-semibold">Dashboard</p>
                <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-all"
                    onClick={() => setIsModalOpen(true)}
                >
                    Create Campaign
                </button>
            </div>
            <p className="text-2xl font-semibold mb-6">My Campaigns:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {!isLoadingMyCampaigns && (
                    myCampaigns && myCampaigns.length > 0 ? (
                        myCampaigns.map((campaign, index) => (
                            <MyCampaignCard
                                key={index}
                                contractAddress={campaign.campaignAddress}
                            />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-lg text-gray-500">No campaigns found</p>
                    )
                )}
            </div>
            
            {isModalOpen && (
                <CreateCampaignModal
                    setIsModalOpen={setIsModalOpen}
                    refetch={refetch}
                />
            )}
        </div>
    );
}

type CreateCampaignModalProps = {
    setIsModalOpen: (value: boolean) => void;
    refetch: () => void;
};


const CreateCampaignModal = ({ setIsModalOpen, refetch }: CreateCampaignModalProps) => {
    const account = useActiveAccount();
    const [isDeployingContract, setIsDeployingContract] = useState<boolean>(false);
    const [campaignName, setCampaignName] = useState<string>("");
    const [campaignDescription, setCampaignDescription] = useState<string>("");
    const [campaignGoal, setCampaignGoal] = useState<number>(1);
    const [campaignDeadline, setCampaignDeadline] = useState<number>(1);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageURL, setImageURL] = useState<string>("");

    const AWS_ACCESS_KEY_ID = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
    const AWS_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;
    const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION;

    // Configure AWS SDK
    const s3 = new AWS.S3({
        region: AWS_REGION, // Replace with your S3 region
        accessKeyId: AWS_ACCESS_KEY_ID, // Set up environment variables for security
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    });

    // Upload image to S3 and return the image URL
    const uploadImageToS3 = async (file: File): Promise<string> => {
        const fileName = `${Date.now()}-${file.name}`;
        const params = {
            Bucket: "blockfundimages", // Replace with your S3 bucket name
            Key: `campaigns/${fileName}`,
            Body: file,
            ContentType: file.type,
        };

        try {
            const data = await s3.upload(params).promise();
            return data.Location; // URL of the uploaded file
        } catch (error) {
            console.error("Error uploading file:", error);
            throw new Error("Error uploading image to S3");
        }
    };

    const handleDeployContract = async () => {
        setIsDeployingContract(true);
        try {
            console.log("Deploying contract...");
            console.log("Contract Parameters:", {
                name: campaignName,
                description: campaignDescription,
                goal: campaignGoal,
                durationInDays: campaignDeadline,
                imageUrls: [imageURL || "https://via.placeholder.com/400"], // Use imageURL if available
            });
            const contractAddress = await deployPublishedContract({
                client: client,
                chain: sepolia,
                account: account!,
                contractId: "Crowdfunding",
                contractParams: {
                    name: campaignName,
                    description: campaignDescription,
                    goal: campaignGoal,
                    durationInDays: campaignDeadline,
                    imageUrls: [imageURL || "https://via.placeholder.com/400"],
                },
                publisher: "0xA0d6aE10F18226D8D26934732b8dcE61dB459fE4",
                version: "1.0.0",
            });
            alert("Contract deployed successfully!");
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeployingContract(false);
            setIsModalOpen(false);
            refetch();
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            setImageFile(file);
            try {
                const url = await uploadImageToS3(file);
                setImageURL(url); // Set the image URL from S3
                console.log(imageURL);
            } catch (error) {
                alert("Failed to upload image. Please try again.");
            }
        }
    };

    const handleCampaignGoal = (value: number) => {
        if (value < 1) {
            setCampaignGoal(1);
        } else {
            setCampaignGoal(value);
        }
    };

    const handleCampaignLengthChange = (value: number) => {
        if (value < 1) {
            setCampaignDeadline(1);
        } else {
            setCampaignDeadline(value);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center backdrop-blur-md">
            <div className="w-full sm:w-1/2 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">Create a Campaign</p>
                    <button
                        className="text-sm px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all dark:bg-gray-700 dark:hover:bg-gray-600"
                        onClick={() => setIsModalOpen(false)}
                    >
                        Close
                    </button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign Name:</label>
                        <input 
                            type="text" 
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            placeholder="Campaign Name"
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 dark:focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign Description:</label>
                        <textarea
                            value={campaignDescription}
                            onChange={(e) => setCampaignDescription(e.target.value)}
                            placeholder="Campaign Description"
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 dark:focus:ring-blue-400"
                        ></textarea>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign Goal:</label>
                        <input 
                            type="number"
                            value={campaignGoal}
                            onChange={(e) => handleCampaignGoal(parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 dark:focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign Length (Days):</label>
                        <input 
                            type="number"
                            value={campaignDeadline}
                            onChange={(e) => handleCampaignLengthChange(parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 dark:focus:ring-blue-400"
                        />
                    </div>
                    {/* Image Upload Input */}
                    <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Campaign Image:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 dark:focus:ring-blue-400"
                        />
                        {imageURL && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-700 dark:text-gray-300">Uploaded Image:</p>
                                <img src={imageURL} alt="Campaign" className="w-32 h-32 object-cover mt-2" />
                            </div>
                        )}
                    </div>

                    <button
                        className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all dark:bg-blue-700 dark:hover:bg-blue-600"
                        onClick={handleDeployContract}
                    >
                        {isDeployingContract ? "Creating Campaign..." : "Create Campaign"}
                    </button>
                </div>
            </div>
        </div>
    );
};