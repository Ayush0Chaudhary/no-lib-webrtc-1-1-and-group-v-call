import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from '@/components/layouts/Base';
import Home from '@/pages/home';
import RoomCallPage from '@/pages/room';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },{
    path: '/room',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <RoomCallPage />,
      },
    ],
  },
]);

export const CustomRouter = () => {
  return <RouterProvider router={router} />;
};
