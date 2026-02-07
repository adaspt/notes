import { Outlet } from 'react-router';

function ListLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <main className="bg-background relative flex flex-col w-full flex-1 h-svh min-w-0">
        <Outlet />
      </main>
    </>
  );
}

export default ListLayout;
