import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMint2Instruction, getMinimumBalanceForRentExemptMint } from "@solana/spl-token"

export function Tokenlaunch() {
    const { connection } = useConnection();
    const wallet = useWallet();

    async function createToken() {
        if (!wallet.connected) {
            console.error("Wallet is not connected");
            return;
        }
    
        const mintKeypair = Keypair.generate();
        const lamports = await getMinimumBalanceForRentExemptMint(connection);
    
        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: MINT_SIZE,
                lamports,
                programId: TOKEN_PROGRAM_ID,
            }),
            createInitializeMint2Instruction(
                mintKeypair.publicKey,
                9,
                wallet.publicKey,
                wallet.publicKey,
                TOKEN_PROGRAM_ID
            )
        );
    
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintKeypair);
    
        try {
            const signature = await wallet.sendTransaction(transaction, connection);
            
            // New way to confirm the transaction
            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash: transaction.recentBlockhash,
                lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
            });
        
            console.log('Transaction confirmed:', confirmation);
            console.log(wallet.connected, wallet.publicKey?.toBase58());
            console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
        } catch (error) {
            console.error('Transaction failed:', error);
        }
    }
    

    return ( 
    
       <div className="bg-black h-screen">
        <h1 className="text-center text-2xl font-mono text-white">Solana Token Builder</h1>
        <div className="flex flex-col  justify-center align-center items-center translate-y-[50%]">

        <input className='inputText w-max py-2 rounded px-10 ' type='text'   placeholder='Name'  ></input> <br />
        <input className='inputText w-max py-2 rounded px-10 ' type='text'   placeholder='Symbol'  ></input> <br />
        <input className='inputText w-max py-2 rounded px-10 ' type='text'   placeholder='Image URL'  ></input> <br />
        <input className='inputText w-max py-2 rounded px-10 ' type='text'   placeholder='Supply'  ></input> <br />
         <button onClick={createToken} className="bg-blue-400 py-3 px-10 rounded  w-max hover:bg-blue-500 transoition duration-200">Create Token</button>
        </div>
     
    </div>
    )
}