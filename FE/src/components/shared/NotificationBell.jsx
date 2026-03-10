
import React, { useState, useEffect } from 'react';
import { notificationApi } from '../../lib/api';
import { Bell, CheckCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const data = await notificationApi.getMy();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationApi.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) fetchNotifications();
        }}>
            <PopoverTrigger asChild>
                <button
                    className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-primary bg-white dark:bg-stone-800 rounded-full shadow-sm border border-stone-100/50 transition-all relative"
                >
                    <span className="material-symbols-outlined">notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4" align="end">
                <div className="p-3 border-b flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-primary hover:underline hover:text-primary/80"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer",
                                        !notification.isRead && "bg-blue-50/50 hover:bg-blue-50"
                                    )}
                                    onClick={(e) => !notification.isRead && handleMarkAsRead(notification.id, e)}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                                notification.type === 'Payment' ? "bg-green-100 text-green-600" :
                                                    notification.type === 'System' ? "bg-blue-100 text-blue-600" :
                                                        "bg-gray-100 text-gray-600"
                                            )}>
                                                {/* Icon based on type */}
                                                <span className="material-symbols-outlined text-sm">
                                                    {notification.type === 'Payment' ? 'payments' :
                                                        notification.type === 'Schedule' ? 'calendar_month' :
                                                            'notifications'}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className={cn("text-sm leading-none", !notification.isRead && "font-semibold")}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-stone-400 font-medium">
                                                    {notification.timeAgo}
                                                </p>
                                            </div>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
