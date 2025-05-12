// In backend/src/main/java/com/eventure/events/Services/PdfTicketService.java
package com.eventure.events.Services;

import com.eventure.events.model.BookingDetails;
import com.eventure.events.model.Events;
import com.eventure.events.model.Users;
import com.eventure.events.dto.Ticket;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfTicketService {

    private static final Logger logger = LoggerFactory.getLogger(PdfTicketService.class);
    private final QrCodeService qrCodeService;

    @Autowired
    public PdfTicketService(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    public byte[] generateTicketPdf(BookingDetails booking, Events event, Users user) throws IOException {
        if (booking == null || event == null || user == null) {
            logger.error("Cannot generate PDF, essential data is missing.");
            throw new IllegalArgumentException("Booking, Event, and User data must not be null.");
        }
        if (booking.getTickets() == null || booking.getTickets().isEmpty()) {
            logger.warn("Booking {} has no tickets to generate PDF for.", booking.getId());
            // Return an empty PDF or throw an error, depending on desired behavior
            // For now, let's throw an error or return a minimal PDF.
            // Creating a minimal PDF indicating no tickets:
            try (PDDocument document = new PDDocument()) {
                 PDPage page = new PDPage(PDRectangle.A4);
                 document.addPage(page);
                 try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                     contentStream.beginText();
                     contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                     contentStream.newLineAtOffset(50, 700);
                     contentStream.showText("No tickets found for this booking.");
                     contentStream.endText();
                 }
                 ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                 document.save(byteArrayOutputStream);
                 return byteArrayOutputStream.toByteArray();
            }
        }


        try (PDDocument document = new PDDocument()) {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");

            // Optional: Add a logo to the first page or each ticket page
            PDImageXObject logoImage = null;
            try {
                ClassPathResource logoResource = new ClassPathResource("EventureLogo.jpeg"); // Make sure this exists!
                if (logoResource.exists()) {
                    try (InputStream logoInputStream = logoResource.getInputStream()) {
                        logoImage = PDImageXObject.createFromByteArray(document, logoInputStream.readAllBytes(), "logo");
                    }
                } else {
                    logger.warn("Logo EventureLogo.jpeg not found in classpath.");
                }
            } catch (IOException e) {
                logger.error("Error loading logo for PDF: {}", e.getMessage(), e);
            }


            for (int i = 0; i < booking.getTickets().size(); i++) {
                Ticket ticket = booking.getTickets().get(i);
                PDPage page = new PDPage(PDRectangle.A4); // One page per ticket, or design multiple on one page
                document.addPage(page);

                try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                    float yPosition = page.getMediaBox().getHeight() - 50;
                    float leftMargin = 50;
                    float rightMargin = page.getMediaBox().getWidth() - 50;
                    float contentWidth = rightMargin - leftMargin;

                    // Draw Logo if available
                    if (logoImage != null) {
                        float logoWidth = 100; // Adjust as needed
                        float logoHeight = (logoImage.getHeight() * logoWidth) / logoImage.getWidth();
                        contentStream.drawImage(logoImage, leftMargin, yPosition - logoHeight, logoWidth, logoHeight);
                        yPosition -= (logoHeight + 20); // Adjust spacing
                    }

                    // Event Name (centered or left-aligned)
                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA_BOLD, 18);
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    contentStream.showText(event.getEventName() != null ? event.getEventName() : "Event Name Missing");
                    contentStream.endText();
                    yPosition -= 25;

                    // Ticket Header
                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    contentStream.showText("Ticket " + (i + 1) + " of " + booking.getTicketCount());
                    contentStream.endText();
                    yPosition -= 20;

                    // Booking ID
                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA, 10);
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    contentStream.showText("Booking ID: " + booking.getId());
                    contentStream.endText();
                    yPosition -= 15;

                    // User Name
                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA, 10);
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    contentStream.showText("Booked By: " + (user.getFirstName() != null ? user.getFirstName() : "") + " " + (user.getLastName() != null ? user.getLastName() : ""));
                    contentStream.endText();
                    yPosition -= 20;

                    // Event Details
                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    contentStream.showText("Event Details:");
                    contentStream.endText();
                    yPosition -= 15;

                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA, 10);
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    contentStream.showText("Date & Time: " + (event.getEventDateTime() != null ? event.getEventDateTime().format(dateFormatter) : "N/A"));
                    contentStream.endText();
                    yPosition -= 15;

                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA, 10);
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    String address = (event.getAddress() != null ? event.getAddress() + ", " : "") +
                                     (event.getCity() != null ? event.getCity() + ", " : "") +
                                     (event.getState() != null ? event.getState() : "");
                    contentStream.showText("Venue: " + address);
                    contentStream.endText();
                    yPosition -= 15;

                    if (event.getEventInstruction() != null && !event.getEventInstruction().isEmpty()) {
                         contentStream.beginText();
                         contentStream.setFont(PDType1Font.HELVETICA, 10);
                         contentStream.newLineAtOffset(leftMargin, yPosition);
                         contentStream.showText("Instructions: " + event.getEventInstruction());
                         contentStream.endText();
                         yPosition -= 15;
                    }


                    // QR Code
                    if (ticket.getTicketId() != null && !ticket.getTicketId().isEmpty()) {
                        try {
                            byte[] qrImageBytes = qrCodeService.generateQrCodeImage(ticket.getTicketId(), 150, 150); // Adjust QR size
                            PDImageXObject pdQrImage = PDImageXObject.createFromByteArray(document, qrImageBytes, "qr_" + ticket.getTicketId());
                            // Center QR code or position it
                            float qrX = leftMargin + (contentWidth / 2) - (pdQrImage.getWidth() / 2); // Example centering
                            float qrY = yPosition - pdQrImage.getHeight() - 20;
                            if (qrY < 50) qrY = 50; // Don't let it go off page
                            contentStream.drawImage(pdQrImage, qrX, qrY, pdQrImage.getWidth(), pdQrImage.getHeight());
                            yPosition = qrY - 15; // Adjust yPosition below QR code

                            contentStream.beginText();
                            contentStream.setFont(PDType1Font.HELVETICA, 8);
                            contentStream.newLineAtOffset(qrX, qrY - 10); // Text below QR
                            contentStream.showText("Ticket ID: " + ticket.getTicketId());
                            contentStream.endText();

                        } catch (Exception e) {
                            logger.error("Error generating or embedding QR code for ticket {}: {}", ticket.getTicketId(), e.getMessage(), e);
                            contentStream.beginText();
                            contentStream.setFont(PDType1Font.HELVETICA, 10);
                            contentStream.newLineAtOffset(leftMargin, yPosition - 50);
                            contentStream.showText("QR Code Error for Ticket ID: " + ticket.getTicketId());
                            contentStream.endText();
                            yPosition -= 70;
                        }
                    } else {
                        contentStream.beginText();
                        contentStream.setFont(PDType1Font.HELVETICA, 10);
                        contentStream.newLineAtOffset(leftMargin, yPosition - 50);
                        contentStream.showText("QR Code Not Available for Ticket ID: " + ticket.getTicketId());
                        contentStream.endText();
                        yPosition -= 70;
                    }

                    // Footer or additional ticket info
                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA_OBLIQUE, 8);
                    contentStream.newLineAtOffset(leftMargin, 30);
                    contentStream.showText("Thank you for booking with Eventure! Present this ticket at the entrance.");
                    contentStream.endText();
                }
            }

            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            document.save(byteArrayOutputStream);
            logger.info("PDF generated successfully for booking ID: {}", booking.getId());
            return byteArrayOutputStream.toByteArray();

        } catch (IOException e) {
            logger.error("IOException while generating PDF for booking ID {}: {}", (booking != null ? booking.getId() : "N/A"), e.getMessage(), e);
            throw e; // Re-throw to be handled by controller
        } catch (Exception e) { // Catch any other unexpected errors
             logger.error("Unexpected error while generating PDF for booking ID {}: {}", (booking != null ? booking.getId() : "N/A"), e.getMessage(), e);
            throw new IOException("Unexpected error generating PDF", e); // Wrap in IOException or a custom PDFException
        }
    }
}