import { useAccount, useSignMessage } from "wagmi";
import { BASE_URL, StyledButton } from "./App";

export function Ballot() {
  const signer = useSignMessage();
  const { address } = useAccount();

  const votes = [
    {
      projectId:
        "0x62b4d6981157e612e93afd529ca87537076c55b113585bd8283fdcf484465df7",
      amount: "4000000",
    },
    {
      projectId:
        "0x5526e506626916e2ae4c40f3ccb08a200f6b4fe72a510a9e43771164e4647990",
      amount: "3000000",
    },
  ];

  return (
    <StyledButton
      onClick={async () => {
        const signature = await signer.signMessageAsync({
          message: JSON.stringify(votes),
        });

        console.log(signature);

        fetch(BASE_URL + "api/ballot/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ signature, address, votes }),
        });
      }}
    >
      Sign Ballot
    </StyledButton>
  );
}
