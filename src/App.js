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

const StyledButton = styled.button`
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

const BASE_URL = "https://optimism-agora-dev.agora-dev.workers.dev/";

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
    fetch(BASE_URL + "api/auth/nonce").then(async (res) => {
      const result = await res.json();
      console.log(result);

      // save nonce to local storage
      localStorage.setItem("nonce", result.nonce);

      return result.nonce;
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

    console.log("create message", message);

    return message;
  },
  verifyMessage: async ({ message, signature }) => {
    // get nonce from local storage
    const nonce = localStorage.getItem("nonce");

    return fetch(BASE_URL + "api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, signature, nonce }),
    }).then(async (res) => {
      const accessToken = (await res.json()).accessToken;
      // save session to local storage
      localStorage.setItem("session", accessToken);
      console.log(accessToken);

      return accessToken;
    });
  },
  getSession: async () => {
    // get session from local storage
    const session = localStorage.getItem("session");

    fetch(BASE_URL + "api/auth/session", {
      headers: { Authorization: `Bearer ${session}` },
    }).then((res) => res.json());
  },
  signOut: async () => {
    // remove session from local storage
    localStorage.removeItem("session");
    console.log("sign out");

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
            </header>
          </div>
        </ConnectKitProvider>
      </SIWEProvider>
    </WagmiConfig>
  );
}

export default App;
