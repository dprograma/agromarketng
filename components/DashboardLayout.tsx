import CustomerNavbar from "@/components/CustomerNavbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen">
        <div className="flex min-h-screen">
            {/* Sidebar Navigation */}
            <CustomerNavbar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-grow overflow-y-auto bg-gray-50">
                <main className="flex-grow p-4 bg-gray-50">{children}</main>
            </div>
        </div>
    </div>
    );
}

