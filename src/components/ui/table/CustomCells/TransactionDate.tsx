import { CalendarIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// 1. Extendemos dayjs con el plugin de UTC
dayjs.extend(utc);

const TransactionDate = ({ row }: any) => {
    // 2. Usamos dayjs.utc() en lugar de dayjs() normal
    const date = dayjs.utc(row.original.saleDate);

    return (
        <div className="flex flex-row items-center gap-2">
            <CalendarIcon className="size-4" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
                {date.format("DD/MM/YYYY")}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
                {/* Ahora mostrará las 21:09 en lugar de restarle las 6 horas */}
                {date.format("HH:mm")}
            </span>
        </div>
    );
};

export default TransactionDate;