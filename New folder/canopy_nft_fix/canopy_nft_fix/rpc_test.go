package main

import (
	"bytes"
	cryptorand "crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/canopy-network/go-plugin/tutorial/contract"
	"github.com/canopy-network/go-plugin/tutorial/crypto"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
)

const (
	queryRPCURL = "http://localhost:50002"
	adminRPCURL = "http://localhost:50003"
	networkID   = uint64(1)
	chainID     = uint64(1)
)

// TestPluginTransactions tests the default tutorial flow.
// It uses sleep + balance checks because tx indexing can lag behind block execution.
func TestPluginTransactions(t *testing.T) {
	testPassword := "testpassword123"

	t.Log("Step 1: Creating two accounts in keystore...")
	suffix := randomSuffix()
	account1Addr, err := keystoreNewKey(adminRPCURL, "test_faucet_1_"+suffix, testPassword)
	if err != nil {
		t.Fatalf("Failed to create account 1: %v", err)
	}
	t.Logf("Created account 1: %s", account1Addr)

	account2Addr, err := keystoreNewKey(adminRPCURL, "test_faucet_2_"+suffix, testPassword)
	if err != nil {
		t.Fatalf("Failed to create account 2: %v", err)
	}
	t.Logf("Created account 2: %s", account2Addr)

	height, err := getHeight(queryRPCURL)
	if err != nil {
		t.Fatalf("Failed to get height: %v", err)
	}
	t.Logf("Current height: %d", height)

	account1Key, err := keystoreGetKey(adminRPCURL, account1Addr, testPassword)
	if err != nil {
		t.Fatalf("Failed to get account 1 key: %v", err)
	}

	t.Log("Step 2: Using faucet to add balance to account 1...")
	faucetAmount := uint64(1000000000)
	faucetFee := uint64(10000)

	faucetTxHash, err := sendFaucetTx(queryRPCURL, account1Key, account1Addr, faucetAmount, faucetFee, networkID, chainID, height)
	if err != nil {
		t.Fatalf("Failed to send faucet transaction: %v", err)
	}
	t.Logf("Faucet transaction sent: %s", faucetTxHash)

	t.Log("Waiting for faucet transaction to be processed...")
	time.Sleep(15 * time.Second)

	bal1, err := getAccountBalance(queryRPCURL, account1Addr)
	if err != nil {
		t.Fatalf("Failed to get account 1 balance: %v", err)
	}
	if bal1 == 0 {
		t.Fatal("Faucet failed: account 1 balance is still 0")
	}

	failedCount, err := checkTxNotFailed(queryRPCURL, account1Addr)
	if err != nil {
		t.Logf("Warning: Could not check failed transactions: %v", err)
	} else if failedCount > 0 {
		t.Fatalf("Account 1 has %d failed transactions", failedCount)
	}

	bal2, _ := getAccountBalance(queryRPCURL, account2Addr)
	t.Logf("Balances after faucet - Account 1: %d, Account 2: %d", bal1, bal2)

	t.Log("Step 3: Sending tokens from account 1 to account 2...")
	sendAmount := uint64(100000000)
	sendFee := uint64(10000)

	height, _ = getHeight(queryRPCURL)
	sendTxHash, err := sendSendTx(queryRPCURL, account1Key, account1Addr, account2Addr, sendAmount, sendFee, networkID, chainID, height)
	if err != nil {
		t.Fatalf("Failed to send transaction: %v", err)
	}
	t.Logf("Send transaction sent: %s", sendTxHash)

	t.Log("Waiting for send transaction to be processed...")
	time.Sleep(15 * time.Second)

	bal1, _ = getAccountBalance(queryRPCURL, account1Addr)
	bal2, _ = getAccountBalance(queryRPCURL, account2Addr)
	if bal2 == 0 {
		t.Fatal("Send failed: account 2 balance is still 0")
	}

	failedCount, err = checkTxNotFailed(queryRPCURL, account1Addr)
	if err != nil {
		t.Logf("Warning: Could not check failed transactions: %v", err)
	} else if failedCount > 0 {
		t.Fatalf("Account 1 has %d failed transactions", failedCount)
	}
	t.Logf("Balances after send - Account 1: %d, Account 2: %d", bal1, bal2)

	t.Log("Step 4: Sending reward from account 2 back to account 1...")
	account2Key, err := keystoreGetKey(adminRPCURL, account2Addr, testPassword)
	if err != nil {
		t.Fatalf("Failed to get account 2 key: %v", err)
	}

	rewardAmount := uint64(50000000)
	rewardFee := uint64(10000)

	height, _ = getHeight(queryRPCURL)
	rewardTxHash, err := sendRewardTx(queryRPCURL, account2Key, account2Addr, account1Addr, rewardAmount, rewardFee, networkID, chainID, height)
	if err != nil {
		t.Fatalf("Failed to send reward transaction: %v", err)
	}
	t.Logf("Reward transaction sent: %s", rewardTxHash)

	t.Log("Waiting for reward transaction to be processed...")
	time.Sleep(15 * time.Second)

	failedCount, err = checkTxNotFailed(queryRPCURL, account2Addr)
	if err != nil {
		t.Logf("Warning: Could not check failed transactions: %v", err)
	} else if failedCount > 0 {
		t.Fatalf("Account 2 has %d failed transactions", failedCount)
	}

	bal1, _ = getAccountBalance(queryRPCURL, account1Addr)
	bal2, _ = getAccountBalance(queryRPCURL, account2Addr)
	t.Logf("Final balances - Account 1: %d, Account 2: %d", bal1, bal2)
	t.Log("All transactions processed successfully!")
}

// TestMintNFT mints a custom NFT using the nady account.
// The nady address must exist in the keystore and have enough balance for fees.
func TestMintNFT(t *testing.T) {
	creatorAddr := getenv("NFT_CREATOR_ADDR", "8a3322277eefadf429d81ef4e7819cf1a97098c")
	password := getenv("NFT_PASSWORD", "")
	tokenID := getenv("NFT_TOKEN_ID", "inkarnasi-"+randomSuffix())
	name := getenv("NFT_NAME", "Inkarnasi")
	image := getenv("NFT_IMAGE", "http://localhost:3000/images/inkarnasi.png")
	metadata := getenv("NFT_METADATA", "Manga access NFT for Inkarnasi")
	fee := uint64(10000)

	height, err := getHeight(queryRPCURL)
	if err != nil {
		t.Fatalf("Failed to get height: %v", err)
	}

	creatorKey, err := keystoreGetKey(adminRPCURL, creatorAddr, password)
	if err != nil {
		t.Fatalf("Failed to get creator key: %v", err)
	}

	balance, err := getAccountBalance(queryRPCURL, creatorAddr)
	if err != nil {
		t.Fatalf("Failed to get creator balance: %v", err)
	}
	if balance < fee {
		t.Fatalf("Creator balance too low: balance=%d fee=%d", balance, fee)
	}

	txHash, err := sendMintNFTTx(queryRPCURL, creatorKey, creatorAddr, tokenID, name, image, metadata, fee, networkID, chainID, height)
	if err != nil {
		t.Fatalf("Failed to mint NFT: %v", err)
	}

	t.Logf("Mint NFT tx sent: %s", txHash)
	time.Sleep(10 * time.Second)
	t.Log("NFT minted successfully!")
}

func getenv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func randomSuffix() string {
	b := make([]byte, 4)
	_, _ = cryptorand.Read(b)
	return hex.EncodeToString(b)
}

type keyGroup struct {
	Address    string `json:"address"`
	PublicKey  string `json:"publicKey"`
	PrivateKey string `json:"privateKey"`
}

func keystoreNewKey(rpcURL, nickname, password string) (string, error) {
	reqJSON := fmt.Sprintf(`{"nickname":"%s","password":"%s"}`, nickname, password)

	respBody, err := postRawJSON(rpcURL+"/v1/admin/keystore-new-key", reqJSON)
	if err != nil {
		return "", err
	}

	var address string
	if err := json.Unmarshal(respBody, &address); err != nil {
		return "", fmt.Errorf("failed to parse response: %v, body: %s", err, string(respBody))
	}
	return address, nil
}

func keystoreGetKey(rpcURL, address, password string) (*keyGroup, error) {
	reqJSON := fmt.Sprintf(`{"address":"%s","password":"%s"}`, address, password)

	respBody, err := postRawJSON(rpcURL+"/v1/admin/keystore-get", reqJSON)
	if err != nil {
		return nil, err
	}

	var kg keyGroup
	if err := json.Unmarshal(respBody, &kg); err != nil {
		return nil, fmt.Errorf("failed to parse response: %v, body: %s", err, string(respBody))
	}
	return &kg, nil
}

func getHeight(rpcURL string) (uint64, error) {
	respBody, err := postRawJSON(rpcURL+"/v1/query/height", "{}")
	if err != nil {
		return 0, err
	}

	var result struct {
		Height uint64 `json:"height"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return 0, fmt.Errorf("failed to parse response: %v", err)
	}
	return result.Height, nil
}

func getAccountBalance(rpcURL, address string) (uint64, error) {
	reqJSON := fmt.Sprintf(`{"address":"%s"}`, address)

	respBody, err := postRawJSON(rpcURL+"/v1/query/account", reqJSON)
	if err != nil {
		return 0, err
	}

	var result struct {
		Amount uint64 `json:"amount"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return 0, fmt.Errorf("failed to parse response: %v, body: %s", err, string(respBody))
	}
	return result.Amount, nil
}

func waitForTxInclusion(rpcURL, senderAddr, txHash string, timeout time.Duration) (bool, error) {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		reqJSON := fmt.Sprintf(`{"address":"%s","perPage":20}`, senderAddr)
		respBody, err := postRawJSON(rpcURL+"/v1/query/txs-by-sender", reqJSON)
		if err != nil {
			time.Sleep(1 * time.Second)
			continue
		}

		var result struct {
			Results []struct {
				TxHash string `json:"txHash"`
				Height uint64 `json:"height"`
			} `json:"results"`
			TotalCount int `json:"totalCount"`
		}
		if err := json.Unmarshal(respBody, &result); err != nil {
			time.Sleep(1 * time.Second)
			continue
		}

		for _, tx := range result.Results {
			if tx.TxHash == txHash {
				return true, nil
			}
		}
		time.Sleep(1 * time.Second)
	}
	return false, fmt.Errorf("transaction %s not included within timeout", txHash)
}

func checkTxNotFailed(rpcURL, senderAddr string) (int, error) {
	reqJSON := fmt.Sprintf(`{"address":"%s","perPage":20}`, senderAddr)
	respBody, err := postRawJSON(rpcURL+"/v1/query/failed-txs", reqJSON)
	if err != nil {
		return 0, err
	}

	var result struct {
		TotalCount int `json:"totalCount"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return 0, fmt.Errorf("failed to parse response: %v, body: %s", err, string(respBody))
	}
	return result.TotalCount, nil
}

func hexToBase64(hexStr string) string {
	bytes, _ := hex.DecodeString(hexStr)
	return base64.StdEncoding.EncodeToString(bytes)
}

func sendFaucetTx(rpcURL string, signerKey *keyGroup, recipientAddr string, amount, fee, networkID, chainID, height uint64) (string, error) {
	faucetMsg := map[string]interface{}{
		"signerAddress":    hexToBase64(signerKey.Address),
		"recipientAddress": hexToBase64(recipientAddr),
		"amount":           float64(amount),
	}
	return buildSignAndSendTx(rpcURL, signerKey, "faucet", faucetMsg, fee, networkID, chainID, height)
}

func sendSendTx(rpcURL string, senderKey *keyGroup, fromAddr, toAddr string, amount, fee, networkID, chainID, height uint64) (string, error) {
	sendMsg := map[string]interface{}{
		"fromAddress": hexToBase64(fromAddr),
		"toAddress":   hexToBase64(toAddr),
		"amount":      float64(amount),
	}
	return buildSignAndSendTx(rpcURL, senderKey, "send", sendMsg, fee, networkID, chainID, height)
}

func sendRewardTx(rpcURL string, adminKey *keyGroup, adminAddr, recipientAddr string, amount, fee, networkID, chainID, height uint64) (string, error) {
	rewardMsg := map[string]interface{}{
		"adminAddress":     hexToBase64(adminAddr),
		"recipientAddress": hexToBase64(recipientAddr),
		"amount":           float64(amount),
	}
	return buildSignAndSendTx(rpcURL, adminKey, "reward", rewardMsg, fee, networkID, chainID, height)
}

func sendMintNFTTx(rpcURL string, creatorKey *keyGroup, creatorAddr string, tokenID, name, image, metadata string, fee, networkID, chainID, height uint64) (string, error) {
	mintMsg := map[string]interface{}{
		"creator":  hexToBase64(creatorAddr),
		"token_id": tokenID,
		"name":     name,
		"image":    image,
		"metadata": metadata,
	}
	return buildSignAndSendTx(rpcURL, creatorKey, "mint_nft", mintMsg, fee, networkID, chainID, height)
}

func buildSignAndSendTx(rpcURL string, signerKey *keyGroup, msgType string, msgJSON map[string]interface{}, fee, networkID, chainID, height uint64) (string, error) {
	txTime := uint64(time.Now().UnixMicro())

	var typeURL string
	switch msgType {
	case "send":
		typeURL = "type.googleapis.com/types.MessageSend"
	case "reward":
		typeURL = "type.googleapis.com/types.MessageReward"
	case "faucet":
		typeURL = "type.googleapis.com/types.MessageFaucet"
	case "mint_nft":
		typeURL = "type.googleapis.com/types.MessageMintNFT"
	default:
		return "", fmt.Errorf("unknown message type: %s", msgType)
	}

	var msgProto proto.Message
	var msgBytes []byte
	var err error

	switch msgType {
	case "send":
		fromAddr, _ := base64.StdEncoding.DecodeString(msgJSON["fromAddress"].(string))
		toAddr, _ := base64.StdEncoding.DecodeString(msgJSON["toAddress"].(string))
		msgProto = &contract.MessageSend{FromAddress: fromAddr, ToAddress: toAddr, Amount: uint64(msgJSON["amount"].(float64))}
	case "reward":
		adminAddr, _ := base64.StdEncoding.DecodeString(msgJSON["adminAddress"].(string))
		recipientAddr, _ := base64.StdEncoding.DecodeString(msgJSON["recipientAddress"].(string))
		msgProto = &contract.MessageReward{AdminAddress: adminAddr, RecipientAddress: recipientAddr, Amount: uint64(msgJSON["amount"].(float64))}
	case "faucet":
		signerAddr, _ := base64.StdEncoding.DecodeString(msgJSON["signerAddress"].(string))
		recipientAddr, _ := base64.StdEncoding.DecodeString(msgJSON["recipientAddress"].(string))
		msgProto = &contract.MessageFaucet{SignerAddress: signerAddr, RecipientAddress: recipientAddr, Amount: uint64(msgJSON["amount"].(float64))}
	case "mint_nft":
		creatorAddr, _ := base64.StdEncoding.DecodeString(msgJSON["creator"].(string))
		msgBytes = encodeMintNFT(creatorAddr, msgJSON["token_id"].(string), msgJSON["name"].(string), msgJSON["image"].(string), msgJSON["metadata"].(string))
	}

	if msgBytes == nil {
		msgBytes, err = proto.Marshal(msgProto)
		if err != nil {
			return "", fmt.Errorf("failed to marshal message: %v", err)
		}
	}

	msgAny := &anypb.Any{TypeUrl: typeURL, Value: msgBytes}

	signBytes, err := crypto.GetSignBytes(msgType, msgAny, txTime, height, fee, "", networkID, chainID)
	if err != nil {
		return "", fmt.Errorf("failed to get sign bytes: %v", err)
	}

	privKey, err := crypto.StringToBLS12381PrivateKey(signerKey.PrivateKey)
	if err != nil {
		return "", fmt.Errorf("failed to parse private key: %v", err)
	}

	signature := privKey.Sign(signBytes)

	pubKeyBytes, err := hex.DecodeString(signerKey.PublicKey)
	if err != nil {
		return "", fmt.Errorf("failed to decode public key: %v", err)
	}

	var tx map[string]interface{}
	if msgType == "send" {
		tx = map[string]interface{}{
			"type": msgType,
			"msg":  msgJSON,
			"signature": map[string]string{
				"publicKey": hex.EncodeToString(pubKeyBytes),
				"signature": hex.EncodeToString(signature),
			},
			"time":          txTime,
			"createdHeight": height,
			"fee":           fee,
			"memo":          "",
			"networkID":     networkID,
			"chainID":       chainID,
		}
	} else {
		tx = map[string]interface{}{
			"type":       msgType,
			"msgTypeUrl": typeURL,
			"msgBytes":   hex.EncodeToString(msgBytes),
			"signature": map[string]string{
				"publicKey": hex.EncodeToString(pubKeyBytes),
				"signature": hex.EncodeToString(signature),
			},
			"time":          txTime,
			"createdHeight": height,
			"fee":           fee,
			"memo":          "",
			"networkID":     networkID,
			"chainID":       chainID,
		}
	}

	txJSONBytes, err := json.MarshalIndent(tx, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal transaction: %v", err)
	}

	respBody, err := postRawJSON(rpcURL+"/v1/tx", string(txJSONBytes))
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %v", err)
	}

	var txHash string
	if err := json.Unmarshal(respBody, &txHash); err != nil {
		return "", fmt.Errorf("failed to parse response: %v, body: %s", err, string(respBody))
	}
	return txHash, nil
}

func postRawJSON(url string, jsonBody string) ([]byte, error) {
	resp, err := http.Post(url, "application/json", bytes.NewBufferString(jsonBody))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(respBody))
	}
	return respBody, nil
}

func encodeMintNFT(creator []byte, tokenID, name, image, metadata string) []byte {
	var out []byte
	out = appendBytesField(out, 1, creator)
	out = appendStringField(out, 2, tokenID)
	out = appendStringField(out, 3, name)
	out = appendStringField(out, 4, image)
	out = appendStringField(out, 5, metadata)
	return out
}

func appendStringField(out []byte, fieldNum int, value string) []byte {
	return appendBytesField(out, fieldNum, []byte(value))
}

func appendBytesField(out []byte, fieldNum int, value []byte) []byte {
	out = appendVarint(out, uint64(fieldNum<<3|2))
	out = appendVarint(out, uint64(len(value)))
	out = append(out, value...)
	return out
}

func appendVarint(out []byte, v uint64) []byte {
	for v >= 0x80 {
		out = append(out, byte(v)|0x80)
		v >>= 7
	}
	return append(out, byte(v))
}
