import { useState } from "react";
import { createTenant, createWallet, deposit } from "./api";

export default function App() {
  const [tenant, setTenant] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [log, setLog] = useState("");

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    const res = await createTenant(e.target.name.value);
    setTenant(res.data);
    setLog(JSON.stringify(res.data, null, 2));
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    const res = await createWallet(tenant.api_key, e.target.owner.value);
    setWallet(res.data);
    setLog(JSON.stringify(res.data, null, 2));
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const res = await deposit(
      tenant.api_key,
      wallet.id,
      e.target.amount.value,
      crypto.randomUUID(),
    );
    setLog(JSON.stringify(res.data, null, 2));
  };

  return (
    <div>
      <form onSubmit={handleCreateTenant}>
        <input name="name" placeholder="Tenant name" required />
        <button type="submit">Create Tenant</button>
      </form>

      {tenant && (
        <form onSubmit={handleCreateWallet}>
          <input name="owner" placeholder="Wallet owner" required />
          <button type="submit">Create Wallet</button>
        </form>
      )}

      {wallet && (
        <form onSubmit={handleDeposit}>
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="Amount"
            required
          />
          <button type="submit">Deposit</button>
        </form>
      )}

      <pre>{log}</pre>
    </div>
  );
}
