import { useAccount, useSignMessage } from "wagmi";
import { StyledButton } from "./App";

export function Ballot() {
  const signer = useSignMessage();
  const { address } = useAccount();

  const r4_ballot_content = {
    allocations: [{ gas_fees: 100 }],
    os_only: false,
    os_multiplier: 1,
  };

  const r5_ballot_content = {
    budget: 8_000_000,
    project_allocations: [
      {
        1: 100,
      },
    ],
    category_allocations: [
      {
        FOO_BAR: 100,
      },
    ],
  };

  return (
    <StyledButton
      onClick={async () => {
        const signature = await signer.signMessageAsync({
          message: JSON.stringify(r5_ballot_content),
        });

        console.log(signature);

        const accessToken = localStorage.getItem("accessToken");

        fetch(`api/v1/retrofunding/rounds/5/ballots/${address}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            signature,
            address,
            ballot_content: r5_ballot_content,
          }),
        });
      }}
    >
      Sign Ballot
    </StyledButton>
  );
}
