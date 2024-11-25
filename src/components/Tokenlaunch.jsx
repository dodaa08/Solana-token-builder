import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_2022_PROGRAM_ID, createMintToInstruction, createAssociatedTokenAccountInstruction, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { useState } from "react";

export default function Tokenlaunch() {
    const [name , setName] = useState('');
    const [symbol , setSymbol] = useState('');
    const [image , setImage] = useState('');
    const [supply , setSupply] = useState('');

    const { connection } = useConnection();
    const wallet = useWallet();

    async function createToken() {
       
        const mintKeypair = Keypair.generate();
        const metadata = {
            mint: mintKeypair.publicKey,
            name: name,
            symbol: symbol,
            uri: image,
            additionalMetadata: [],
        };
        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintKeypair.publicKey,
                metadata: mintKeypair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            }),
        );
            
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintKeypair);

        await wallet.sendTransaction(transaction, connection);

        console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
        const associatedToken = getAssociatedTokenAddressSync(
            mintKeypair.publicKey,
            wallet.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
        );

        console.log(associatedToken.toBase58());

        const transaction2 = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedToken,
                wallet.publicKey,
                mintKeypair.publicKey,
                TOKEN_2022_PROGRAM_ID,
            ),
        );

        await wallet.sendTransaction(transaction2, connection);

        const transaction3 = new Transaction().add(
            createMintToInstruction(mintKeypair.publicKey, associatedToken, wallet.publicKey, 1000000000, [], TOKEN_2022_PROGRAM_ID)
        );

        await wallet.sendTransaction(transaction3, connection);

        console.log("Minted!");
    }
    

    return  (
        <>
        
       <div className="bg-black h-screen">
        <h1 className="text-center text-2xl font-mono text-white">Solana Token Builder</h1>
        <div className="flex flex-col  justify-center align-center items-center translate-y-[50%]">

        <input className='inputText w-max py-2 rounded px-10 ' type='text'   placeholder='Name'  value={name} onChange={(e)=>{setName(e.target.value)}} ></input> <br />
        <input className='inputText w-max py-2 rounded px-10 ' type='text'   placeholder='Symbol'  value={symbol} onChange={(e)=>{setSymbol(e.target.value)}}></input> <br />
        <input className='inputText w-max py-2 rounded px-10 ' type='text'   placeholder='Image URL' value={image} onChange={(e)=>{setImage(e.target.value)}} ></input> <br />
        <input className='inputText w-max py-2 rounded px-10 ' type='text'   placeholder='Supply' value={supply} onChange={(e)=>{setSupply(e.target.value)}} ></input> <br />
         <button onClick={createToken} className="bg-blue-400 py-3 px-10 rounded  w-max hover:bg-blue-500 transoition duration-200">Create Token</button>
        </div>
     
    </div>
        </>
    )
}