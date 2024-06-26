import { useAccount, useSignMessage } from "wagmi";
import { StyledButton } from "./App";

export function Ballot() {
  const signer = useSignMessage();
  const { address } = useAccount();

  const ballot_content = {
    allocations: [{ gas_fees: 100 }],
    os_only: false,
    os_multiplier: 1,
  };

  return (
    <StyledButton
      onClick={async () => {
        const signature = await signer.signMessageAsync({
          message: JSON.stringify(ballot_content),
        });

        console.log(signature);

        fetch(`api/v1/retrofunding/rounds/4/ballots/${address}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ signature, address, ballot_content }),
        });
      }}
    >
      Sign Ballot
    </StyledButton>
  );
}
