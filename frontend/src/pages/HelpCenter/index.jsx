import React, { useState } from 'react';
import {
  HelpCircle,
  FileText,
  Mail,
  ChevronDown,
  ChevronUp,
  Search,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import Button from '../../components/ui/Button';
import { showToast } from '../../components/ui/Toast';

const FAQS_LIST = [
  {
    q: 'How do I dispatch a route trip?',
    a: 'To dispatch a trip, navigate to the Trips module and click on "Dispatch Cargo". Ensure both the carrier vehicle and custodian driver are currently "Available". If the vehicle is in maintenance or the driver is suspended, licensing compliance checks will fail and block dispatches.'
  },
  {
    q: 'How is driver safety score calculated?',
    a: 'Driver ratings are evaluated on route completions, timely arrivals, and fuel consumption efficiency relative to standard averages. Safety officers can update driver status flags on the console if violations occur.'
  },
  {
    q: 'What should I do if a vehicle breaks down on duty?',
    a: 'Immediately open the Maintenance Logbook module and schedule a "Breakdown Servicing". This will automatically update the vehicle status in the database to "Maintenance", preventing further dispatches until mechanical sign-off occurs.'
  },
  {
    q: 'How does theme synchronization work?',
    a: 'Go to Settings module. Under "Display Theme", you can select Light, Dark, or System mode to align colors with your preference. Theme changes persist across sessions using LocalStorage.'
  }
];

const HelpCenter = () => {
  const [openIndex, setOpenIndex] = useState(null);
  
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'System Error',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      showToast.error('Please input subject and issue directives');
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      showToast.success('Support ticket submitted successfully. Support team notified.');
      setTicketForm({ subject: '', category: 'System Error', description: '' });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <PageContainer>
      <div className="space-y-6 select-none text-left max-w-4xl">
        
        {/* Help Center Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* FAQ Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h4 className="text-[11px] font-black text-text-main uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-2">
                <HelpCircle size={15} className="text-info" /> Frequently Asked Questions
              </h4>

              <div className="space-y-3">
                {FAQS_LIST.map((faq, idx) => {
                  const isOpen = openIndex === idx;
                  return (
                    <div key={idx} className="border border-border/50 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-3.5 bg-hover/10 text-xs font-bold text-text-main hover:bg-hover transition-colors"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {isOpen && (
                        <div className="p-3.5 bg-card text-[11px] font-semibold text-text-secondary border-t border-border/40 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Documentation Links */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h4 className="text-[11px] font-black text-text-main uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-2">
                <BookOpen size={15} className="text-info" /> Platform User Guides
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-text-main">
                <a href="#fleet" onClick={(e) => { e.preventDefault(); showToast.info('Downloading Fleet Guide PDF...'); }} className="border border-border/60 p-3 rounded-lg flex items-center gap-3 bg-hover/5 hover:bg-hover/20 transition-all">
                  <FileText size={16} className="text-info shrink-0" />
                  <span>Odoo Fleet Inventory Guide.pdf</span>
                </a>
                <a href="#dispatch" onClick={(e) => { e.preventDefault(); showToast.info('Downloading Dispatch Guide PDF...'); }} className="border border-border/60 p-3 rounded-lg flex items-center gap-3 bg-hover/5 hover:bg-hover/20 transition-all">
                  <FileText size={16} className="text-info shrink-0" />
                  <span>Route Dispatch Instructions.pdf</span>
                </a>
              </div>
            </div>
          </div>

          {/* Raise Support Ticket Form */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 h-fit md:col-span-1">
            <h4 className="text-[11px] font-black text-text-main uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-2">
              <MessageSquare size={15} className="text-info" /> Raise Support Ticket
            </h4>

            <form onSubmit={handleTicketSubmit} className="space-y-3.5 text-xs font-semibold text-text-secondary">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] uppercase font-bold">Issue Category</label>
                <select
                  value={ticketForm.category}
                  onChange={e => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                  className="bg-background text-text-main border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-info"
                >
                  <option value="System Error">Console System Error</option>
                  <option value="Billing Issue">Billing / Invoices</option>
                  <option value="Feedback">Feedback suggestion</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] uppercase font-bold">Subject heading</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={e => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Dashboard metrics out of sync"
                  className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-info"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] uppercase font-bold">Problem details</label>
                <textarea
                  value={ticketForm.description}
                  onChange={e => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe your issue with error codes or details..."
                  className="bg-background text-text-main border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-info"
                />
              </div>

              <Button variant="info" type="submit" loading={isSubmitting} className="w-full font-bold">
                Submit Support Ticket
              </Button>
            </form>
          </div>

        </div>

      </div>
    </PageContainer>
  );
};

export default HelpCenter;
