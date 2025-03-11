#!/bin/bash

# Set common variables
INPUT_BOX_ADDRESS="0x59b22D57D4f067708AB0c00552767405926dc768"
APPLICATION_ADDRESS="0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e"
MNEMONIC="test test test test test test test test test test test junk"
RPC_URL="http://localhost:8545/"

# Function to send input using cast
send_input() {
    local input=$1
    local index=$2
    cast send \
        --mnemonic "$MNEMONIC" \
        --mnemonic-index $index \
        --rpc-url "$RPC_URL" \
        $INPUT_BOX_ADDRESS \
        "addInput(address,bytes)(bytes32)" $APPLICATION_ADDRESS $input
}

echo "Testing Genre functions..."

# 1. Create a new Genre

echo "1. Creating a Genre..."
CREATE_INPUT="7b226d6574686f64223a20226372656174655f67656e7265222c202261726773223a207b226e616d65223a2022476f7370656c222c2022696d61676555726c223a202268747470733a2f2f696d672e6672656570696b2e636f6d2f667265652d70686f746f2f6272696768742d6c696768742d6a657375732d63726f73735f32332d323135303937383833382e6a7067222c20226465736372697074696f6e223a2022476f7370656c206d7573696320697320746865204166726963616e2d416d65726963616e2043687269737469616e20736f6e677320636f6d707269736564206f662068796d6e7320616e64206f74686572206f72616c20747261646974696f6e73227d7d"
send_input $CREATE_INPUT 0

# 2. Update Genre
echo "2. Updating Genre..."
UPDATE_INPUT="7b226d6574686f64223a20227570646174655f67656e7265222c202261726773223a207b226964223a20312c20226e616d65223a2022476f7370656c222c2022696d61676555726c223a202268747470733a2f2f696d672e6672656570696b2e636f6d2f667265652d70686f746f2f6272696768742d6c696768742d6a657375732d63726f73735f32332d323135303937383833382e6a7067222c20226465736372697074696f6e223a2022476f7370656c206d75736963206973206172652043687269737469616e20736f6e6773207468617420636f6d707269736573206f662068796d6e7320616e64206f74686572206f72616c20747261646974696f6e73227d7d"
send_input $UPDATE_INPUT 0

# echo "   Appending to the User (3/5)..."
# APPEND_INPUT_2="7b22616374696f6e223a20226a616d2e617070656e64222c20226a616d4944223a20302c2022656e747279223a224c696665206973206173206368616f746963206173206120737175697272656c20696e20747261666669632c2064617274696e67206261636b20616e6420666f7274682c20686f70696e6720666f722074686520626573742e227d"
# send_input $APPEND_INPUT_2 2

# echo "   Appending to the User (4/5)..."
# APPEND_INPUT_3="7b22616374696f6e223a20226a616d2e617070656e64222c20226a616d4944223a20302c2022656e747279223a224c69666520697320617320627573792061732061206265652077697468206120746f2d646f206c6973742c2062757a7a696e6720616c6c207468652074696d65227d"
# send_input $APPEND_INPUT_3 3

# echo "   Appending to the User (5/5)..."
# APPEND_INPUT_4="7b22616374696f6e223a20226a616d2e617070656e64222c20226a616d4944223a20302c2022656e747279223a224c696665206973206173206c6f6164656420617320616e20616e74227d"
# send_input $APPEND_INPUT_4 4

# 3. Simple Ether deposit to the dApp
# echo "3. Performing simple Ether deposit to the dApp..."
# cast send \
#     --mnemonic "$MNEMONIC" \
#     --mnemonic-index 0 \
#     --rpc-url "$RPC_URL" \
#     0xfa2292f6D85ea4e629B156A4f99219e30D12EE17 \
#     "depositEther(address,bytes)" \
#     $APPLICATION_ADDRESS \
#     0x \
#     --value 2ether

# Set NFT address
# echo "Setting NFT address..."
# NFT_ADDRESS_INPUT="7b22616374696f6e223a226a616d2e7365744e465441646472657373222c202261646472657373223a22307837313235313665363143384233383364463441363343466538336437373031426365353442303365227d"
# send_input $NFT_ADDRESS_INPUT 0

# 4. Ether Deposit to Mint a NFT
# echo "4. Performing Ether deposit to mint a NFT..."
# cast send \
#     --mnemonic "$MNEMONIC" \
#     --mnemonic-index 5 \
#     --rpc-url "$RPC_URL" \
#     0xfa2292f6D85ea4e629B156A4f99219e30D12EE17 \
#     "depositEther(address,bytes)" \
#     $APPLICATION_ADDRESS \
#     0x7b22616374696f6e223a226a616d2e6d696e74222c20226a616d4944223a307d \
#     --value 3ether

# echo "Test script completed."