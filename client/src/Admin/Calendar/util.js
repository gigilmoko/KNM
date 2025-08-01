// util.js

// Existing styles
export const CALENDAR_EVENT_STYLE = {
    "BLUE": "bg-blue-200 dark:bg-blue-600 dark:text-blue-100",
    "GREEN": "bg-green-200 dark:bg-green-600 dark:text-green-100",
    "PURPLE": "bg-purple-200 dark:bg-purple-600 dark:text-purple-100",
    "ORANGE": "bg-orange-200 dark:bg-orange-600 dark:text-orange-100",
    "PINK": "bg-pink-200 dark:bg-pink-600 dark:text-pink-100",
    "MORE": "hover:underline cursor-pointer font-medium"
};

// Function to generate a random color class from predefined options
export const getRandomEventColorClass = () => {
    const colors = Object.values(CALENDAR_EVENT_STYLE);
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};
