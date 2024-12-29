import BellIcon from '@heroicons/react/24/outline/BellIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import TableCellsIcon from '@heroicons/react/24/outline/TableCellsIcon';
import WalletIcon from '@heroicons/react/24/outline/WalletIcon';
import CodeBracketSquareIcon from '@heroicons/react/24/outline/CodeBracketSquareIcon';
import DocumentIcon from '@heroicons/react/24/outline/DocumentIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon';
import ArrowRightOnRectangleIcon from '@heroicons/react/24/outline/ArrowRightOnRectangleIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import Cog6ToothIcon from '@heroicons/react/24/outline/Cog6ToothIcon';
import BoltIcon from '@heroicons/react/24/outline/BoltIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import InboxArrowDownIcon from '@heroicons/react/24/outline/InboxArrowDownIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import KeyIcon from '@heroicons/react/24/outline/KeyIcon';
import DocumentDuplicateIcon from '@heroicons/react/24/outline/DocumentDuplicateIcon';
import ShoppingBagIcon from '@heroicons/react/24/outline/ShoppingBagIcon';
import TagIcon from '@heroicons/react/24/outline/TagIcon';
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
    icon: <UsersIcon className={iconClasses}/>, // Users icon for the 'Users' section
    name: 'Users',
  },
  {
    path: '', // Members with submenu
    icon: <UserIcon className={`${iconClasses} inline`}/>, // User icon for 'Members'
    name: 'Members',
    submenu: [
      {
        path: '/admin/members/list',
        icon: <UserIcon className={submenuIconClasses}/>, // User icon for 'Members List'
        name: 'Members List',
      },
      {
        path: '/admin/members/new',
        icon: <UserIcon className={submenuIconClasses}/>, // User icon for 'Members List'
        name: 'New Member',
      },
      {
        path: '/admin/members/confirmation',
        icon: <CalendarDaysIcon className={submenuIconClasses}/>, // Calendar icon for 'Members Approval'
        name: 'Members Approval',
      },
    ]
  },
  {
    path: '', // Products with submenu
    icon: <ShoppingBagIcon className={`${iconClasses} inline`}/>, // Shopping Bag icon for 'Products'
    name: 'Product',
    submenu: [
      {
        path: '/admin/products',
        icon: <ShoppingBagIcon className={submenuIconClasses}/>, // Shopping Bag icon for 'Product List'
        name: 'Product List',
      },
      {
        path: '/admin/products/new',
        icon: <ShoppingBagIcon className={submenuIconClasses}/>, // Shopping Bag icon for 'New Products'
        name: 'New Products',
      },
    ]
  },
  {
    path: '', // Categories with submenu
    icon: <TagIcon className={`${iconClasses} inline`}/>, // Tag icon for 'Categories'
    name: 'Category',
    submenu: [
      {
        path: '/admin/category',
        icon: <TagIcon className={submenuIconClasses}/>, // Tag icon for 'Category List'
        name: 'Category List',
      },
      {
        path: '/admin/category/new',
        icon: <TagIcon className={submenuIconClasses}/>, // Tag icon for 'New Category'
        name: 'New Category',
      },
    ]
  },
  {
    path: '', // Calendar with submenu
    icon: <CalendarDaysIcon className={`${iconClasses} inline`}/>, // Calendar Days icon for 'Calendar'
    name: 'Calendar',
    submenu: [
      {
        path: '/admin/calendar/',
        icon: <CalendarDaysIcon className={submenuIconClasses}/>, // Calendar Days icon for 'Calendar'
        name: 'Calendar',
      },
      {
        path: '/admin/calendar/list',
        icon: <CalendarIcon className={submenuIconClasses}/>, // Calendar icon for 'Calendar List'
        name: 'Calendar List',
      },
    ]
  },
  {
    path: '', // Categories with submenu
    icon: <TagIcon className={`${iconClasses} inline`}/>, // Tag icon for 'Categories'
    name: 'Orders',
    submenu: [
      {
        path: '/admin/orders/list',
        icon: <TagIcon className={submenuIconClasses}/>, // Tag icon for 'Category List'
        name: 'Orders List',
      },
      {
        path: '/admin/category/new',
        icon: <TagIcon className={submenuIconClasses}/>, // Tag icon for 'New Category'
        name: 'New Category',
      },
    ]
  },
  {
    path: '', // Categories with submenu
    icon: <TagIcon className={`${iconClasses} inline`}/>, // Tag icon for 'Categories'
    name: 'Feedbacks',
    submenu: [
      {
        path: '/admin/feedback/list',
        icon: <ChartBarIcon className={submenuIconClasses}/>, // Chart Bar icon for 'Analytics'
        name: 'Feedback List',
      },
      {
        path: '/admin/event/feedback/list',
        icon: <ChartBarIcon className={submenuIconClasses}/>, // Tag icon for 'New Category'
        name: 'Event Feedback List',
      },
      {
        path: '/admin/product/feedback/list',
        icon: <ChartBarIcon className={submenuIconClasses}/>, // Tag icon for 'New Category'
        name: 'Product Feedback List',
      },
    ]
  },
  {
    path: '/admin/charts',
    icon: <ChartBarIcon className={iconClasses}/>, // Chart Bar icon for 'Analytics'
    name: 'Analytics',
  },
];

export default routes;
