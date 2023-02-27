import { useMoralis, useWeb3Contract } from "react-moralis"
import { abi, contractAddress } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddress ? contractAddress[chainId][0] : null
    let [entranceFee, setEntranceFee] = useState("0")
    let [numPlayer, setNumPlayer] = useState("0")
    let [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = (
            await getEntranceFee({
                onError: (error) => console.log(`getEntranceFee ${error}`),
            })
        ).toString()
        const numPlayerFromCall = (
            await getNumberOfPlayers({
                onError: (error) => console.log(`getNumberOfPlayers ${error}`),
            })
        ).toString()
        const recentWinnerFromCall = (
            await getRecentWinner({
                onError: (error) => console.log(`getRecentWinner ${error}`),
            })
        ).toString()
        setNumPlayer(numPlayerFromCall)
        setRecentWinner(recentWinnerFromCall)
        setEntranceFee(entranceFeeFromCall)
        console.log(
            `chainId ${chainId} raffleAddress ${raffleAddress} entranceFeeFromCall: ${entranceFeeFromCall}`
        )
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }
    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction completed!",
            title: "Tx notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            Lottery Entrance
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>Entrance Fee {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div>Number of Players: {numPlayer} </div>
                    <div>Recent Winner: {recentWinner} </div>
                </div>
            ) : (
                <div>No raffle address detected</div>
            )}
        </div>
    )
}
