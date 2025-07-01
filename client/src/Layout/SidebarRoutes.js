import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import TagIcon from '@heroicons/react/24/outline/TagIcon';
import ShoppingBagIcon from '@heroicons/react/24/outline/ShoppingBagIcon';
import ClipboardDocumentListIcon from '@heroicons/react/24/outline/ClipboardDocumentListIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon';
import ClipboardDocumentCheckIcon from '@heroicons/react/24/outline/ClipboardDocumentCheckIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import DocumentChartBarIcon from '@heroicons/react/24/outline/DocumentChartBarIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';

const iconClasses = `h-6 w-6`;
const submenuIconClasses = `h-5 w-5`;

const routes = [
  {
    path: '/admin/dashboard',
    icon: <Squares2X2Icon className={iconClasses}/>,
    name: 'Dashboard',
  },
  {
    path: '/admin/users/list',
    icon: <UsersIcon className={iconClasses}/>,
    name: 'Users',
  },
  {
    path: '',
    icon: <UserIcon className={iconClasses}/>,
    name: 'Members',
    submenu: [
      {
        path: '/admin/members/list',
        icon: <UserIcon className={submenuIconClasses}/>,
        name: 'Members List',
      },
      {
        path: '/admin/members/new',
        icon: <UserIcon className={submenuIconClasses}/>,
        name: 'New Member',
      },
      {
        path: '/admin/members/confirmation',
        icon: <CalendarDaysIcon className={submenuIconClasses}/>,
        name: 'Members Approval',
      },
    ]
  },
  {
    path: '',
    icon: <TagIcon className={iconClasses}/>,
    name: 'Category',
    submenu: [
      {
        path: '/admin/category',
        icon: <TagIcon className={submenuIconClasses}/>,
        name: 'Category List',
      },
      // {
      //   path: '/admin/category/new',
      //   icon: <TagIcon className={submenuIconClasses}/>,
      //   name: 'New Category',
      // },
    ]
  },
  {
    path: '',
    icon: <ShoppingBagIcon className={iconClasses}/>,
    name: 'Product',
    submenu: [
      {
        path: '/admin/products',
        icon: <ShoppingBagIcon className={submenuIconClasses}/>,
        name: 'Product List',
      },
  
      // {
      //   path: '/admin/products/new',
      //   icon: <ShoppingBagIcon className={submenuIconClasses}/>,
      //   name: 'New Product',
      // },
    ]
  },
  {
    path: '',
    icon: <ClipboardDocumentListIcon className={iconClasses}/>,
    name: 'Order',
    submenu: [
      {
        path: '/admin/orders/list',
        icon: <ClipboardDocumentListIcon className={submenuIconClasses}/>,
        name: 'Orders List',
      },
    ]
  },
  {
    path: '',
    icon: <TruckIcon className={iconClasses}/>,
    name: 'Delivery',
    submenu: [
      {
        path: '/admin/delivery/list',
        icon: <TruckIcon className={submenuIconClasses}/>,
        name: 'Delivery List',
      },
      // {
      //   path: '/admin/delivery/new',
      //   icon: <TruckIcon className={submenuIconClasses}/>,
      //   name: 'New Delivery',
      // },
      // {
      //   path: '/admin/delivery/update/:id',
      //   icon: <TruckIcon className={submenuIconClasses}/>,
      //   name: 'Update Delivery',
      // },
    ]
  },
  {
    path: '',
    icon: <CalendarDaysIcon className={iconClasses}/>,
    name: 'Calendar',
    submenu: [
      {
        path: '/admin/calendar/',
        icon: <CalendarDaysIcon className={submenuIconClasses}/>,
        name: 'Calendar',
      },
      {
        path: '/admin/calendar/list',
        icon: <CalendarIcon className={submenuIconClasses}/>,
        name: 'Calendar List',
      },
    ]
  },
  {
    path: '',
    icon: <ClipboardDocumentCheckIcon className={iconClasses}/>,
    name: 'Task',
    submenu: [
      {
        path: '/admin/tasks',
        icon: <ClipboardDocumentCheckIcon className={submenuIconClasses}/>,
        name: 'Task List',
      },
      // {
      //   path: '/admin/tasks/new',
      //   icon: <ClipboardDocumentCheckIcon className={submenuIconClasses}/>,
      //   name: 'New Task',
      // },
    ]
  },
  {
    path: '',
    icon: <UserGroupIcon className={iconClasses}/>,
    name: 'Rider',
    submenu: [
      {
        path: '/admin/rider/list',
        icon: <UserGroupIcon className={submenuIconClasses}/>,
        name: 'Rider List',
      },
      // {
      //   path: '/admin/rider/new/',
      //   icon: <UserGroupIcon className={submenuIconClasses}/>,
      //   name: 'Create New Rider',
      // },
    ]
  },
  {
    path: '',
    icon: <TruckIcon className={iconClasses}/>,
    name: 'Truck',
    submenu: [
      {
        path: '/admin/truck/list',
        icon: <TruckIcon className={submenuIconClasses}/>,
        name: 'Truck List',
      },
      // {
      //   path: '/admin/truck/new',
      //   icon: <TruckIcon className={submenuIconClasses}/>,
      //   name: 'Create New Truck',
      // },
    ]
  },
  {
    path: '',
    icon: <ChartBarIcon className={iconClasses}/>,
    name: 'Forecast',
    submenu: [
      {
        path: '/admin/forecast/list',
        icon: <ChartBarIcon className={submenuIconClasses}/>,
        name: 'Forecast List',
      },
      {
        path: '/admin/forecast/graph',
        icon: <ChartBarIcon className={submenuIconClasses}/>,
        name: 'Forecast Graph',
      },
      // {
      //   path: '/admin/forecast/create',
      //   icon: <ChartBarIcon className={submenuIconClasses}/>,
      //   name: 'New Forecast',
      // },
    ]
  },
  {
    path: '',
    icon: <ChatBubbleLeftRightIcon className={iconClasses}/>,
    name: 'Feedback',
    submenu: [
      {
        path: '/admin/feedback/list',
        icon: <ChatBubbleLeftRightIcon className={submenuIconClasses}/>,
        name: 'Application Feedback',
      },
      {
        path: '/admin/event/feedback/list',
        icon: <ChatBubbleLeftRightIcon className={submenuIconClasses}/>,
        name: 'Event Feedback List',
      },
      {
        path: '/admin/product/feedback/list',
        icon: <ChatBubbleLeftRightIcon className={submenuIconClasses}/>,
        name: 'Product Feedback List',
      },
    ]
  },
  {
    path: '',
    icon: <DocumentChartBarIcon className={iconClasses}/>,
    name: 'Analytical Report',
    submenu: [
      {
        path: '/admin/reports/revenue',
        icon: <DocumentChartBarIcon className={submenuIconClasses}/>,
        name: 'Revenue Report',
      },
      {
        path: '/admin/reports/orders',
        icon: <DocumentChartBarIcon className={submenuIconClasses}/>,
        name: 'Order Reports',
      },
      {
        path: '/admin/reports/users',
        icon: <DocumentChartBarIcon className={submenuIconClasses}/>,
        name: 'User Reports',
      },
      {
        path: '/admin/products/top',
        icon: <ShoppingBagIcon className={submenuIconClasses}/>,
        name: 'Top Products',
      },
    ]
  },
];

export default routes;