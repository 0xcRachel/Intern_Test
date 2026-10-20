import { Outlet } from "react-router";
import { RequireAdmin } from "../../components/auth-gate";
import { AdminShell } from "../../components/admin-shell";

export default function AdminLayout() {
  return (
    <RequireAdmin>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </RequireAdmin>
  );
}
