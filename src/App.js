import "./App.css";
import { SiweMessage } from "siwe";
import {
  ConnectKitButton,
  ConnectKitProvider,
  SIWEProvider,
  getDefaultConfig,
} from "connectkit";
import styled from "styled-components";
import { WagmiConfig, createConfig } from "wagmi";
import { optimism } from "viem/chains";
import { Ballot } from "./Ballot";
import { decodeJwt } from "jose";

export const StyledButton = styled.button`
  cursor: pointer;
  position: relative;
  display: inline-block;
  padding: 14px 24px;
  color: #ffffff;
  background: #1a88f8;
  font-size: 16px;
  font-weight: 500;
  border-radius: 10rem;
  box-shadow: 0 4px 24px -6px #1a88f8;

  transition: 200ms ease;
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 6px 40px -6px #1a88f8;
  }
  &:active {
    transform: translateY(-3px);
    box-shadow: 0 6px 32px -6px #1a88f8;
  }
`;

const wagmiClient = createConfig(
  getDefaultConfig({
    appName: "Agora",
    walletConnectProjectId:
      process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || "",
    alchemyId: process.env.REACT_APP_ALCHEMY_ID || "",
    chains: [optimism],
  })
);

const siweConfig = {
  getNonce: async () =>
    fetch("api/v1/auth/nonce").then(async (res) => {
      const result = await res.text();
      localStorage.setItem("nonce", result);

      return result;
    }),
  createMessage: ({ nonce, address, chainId }) => {
    const message = new SiweMessage({
      version: "1",
      domain: window.location.host,
      uri: window.location.origin,
      address,
      chainId,
      nonce,
      statement: "Sign in to Agora Optimism",
    }).prepareMessage();

    return message;
  },
  verifyMessage: async ({ message, signature }) => {
    const nonce = localStorage.getItem("nonce");
    return fetch("api/v1/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 937076a5-91a6-4da2-bc71-0310dbd3637f`,
      },
      body: JSON.stringify({ message, signature, nonce }),
    }).then(async (res) => {
      const accessToken = (await res.json()).access_token;
      localStorage.setItem("accessToken", accessToken);
      return accessToken;
    });
  },
  getSession: async () => {
    const session = localStorage.getItem("accessToken");
    if (!session) {
      return null;
    }

    console.log(session);
    // decode JWT to get session info
    const decoded = decodeJwt(session);
    const siweData = decoded.siwe;

    console.log(decoded);

    return {
      address: siweData.address,
      chainId: Number(siweData.chainId),
    };
  },
  signOut: async () => {
    localStorage.removeItem("accessToken");
    return true;
  },
};

function App() {
  return (
    <WagmiConfig config={wagmiClient}>
      <SIWEProvider {...siweConfig}>
        <ConnectKitProvider options={{ walletConnectCTA: "both" }}>
          <div className="App">
            <header className="App-header">
              <ConnectKitButton.Custom>
                {({ isConnected, show, truncatedAddress, ensName }) => {
                  return (
                    <StyledButton onClick={show}>
                      {isConnected
                        ? ensName ?? truncatedAddress
                        : "Connect Wallet"}
                    </StyledButton>
                  );
                }}
              </ConnectKitButton.Custom>
              <br />
              <Ballot />
            </header>
          </div>
        </ConnectKitProvider>
      </SIWEProvider>
    </WagmiConfig>
  );
}

export default App;
