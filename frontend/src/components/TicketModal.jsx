'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function TicketModal({ visible, onClose, tickets }) {
  useEffect(() => {
    if (visible) {
      console.log('TicketModal tickets:', tickets);
    }
  }, [visible, tickets]);

  if (!visible) return null;

  if (!tickets || tickets.length === 0) {
    return (
      <div className="fixed z-20 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">No Tickets Available</h3>
              <button onClick={onClose}>
                <X className="h-6 w-6 text-gray-600 hover:text-gray-800" />
              </button>
            </div>
            <p className="text-gray-500">No ticket data is available to display.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed z-20 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Your Tickets</h3>
            <button onClick={onClose}>
              <X className="h-6 w-6 text-gray-600 hover:text-gray-800" />
            </button>
          </div>

          <div className="overflow-x-auto flex space-x-4 py-2">
            {tickets.map((ticket, index) => (
              <div key={ticket.ticketId} className="flex-shrink-0 border rounded p-4 bg-gray-100 text-center">
                <p className="mb-2 text-sm font-medium">Ticket {index + 1}</p>
                <div className="w-40 h-40 flex items-center justify-center bg-white">
                  <QRCodeCanvas
                    value={ticket.qrCodeValue}
                    size={160}
                    level="H"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-600">{ticket.ticketId}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 