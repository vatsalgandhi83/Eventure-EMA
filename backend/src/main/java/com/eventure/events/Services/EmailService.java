package com.eventure.events.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.eventure.events.dto.Ticket;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private QrCodeService qrCodeService;

    public void sendHtmlEmail(String to, String subject, String templatePath, Map<String, String> variables, List<Ticket> tickets) throws Exception {
        try {
            logger.info("Attempting to send email to: {}", to);
            
            String htmlContent = loadTemplate(templatePath, variables);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
            
            helper.setTo(to);
            helper.setSubject(subject);

            // If tickets are present and it's a confirmation email (check template path or add a flag)
            if (tickets != null && !tickets.isEmpty() && templatePath.contains("booking-confirmation.html")) {
                logger.info("Processing {} tickets for email.", tickets.size());
                StringBuilder ticketsHtmlBuilder = new StringBuilder(); // Use StringBuilder for efficiency
                for (Ticket ticket : tickets) {
                    if (ticket.getQrCodeValue() != null && !ticket.getQrCodeValue().isEmpty()) {
                        try {
                            byte[] qrImageBytes = qrCodeService.generateQrCodeImage(ticket.getQrCodeValue(), 200, 200);
                            // Create a unique Content-ID (CID) for each QR code image
                            String cid = "ticketQr_" + ticket.getTicketId().replaceAll("[^a-zA-Z0-9_]", ""); // Ensure CID is valid
                            helper.addInline(cid, new ByteArrayResource(qrImageBytes), "image/png");
                            
                            ticketsHtmlBuilder.append("<div style='margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; background-color: #fff; border-radius: 5px;'>");
                            ticketsHtmlBuilder.append("<strong>Ticket ID:</strong> ").append(ticket.getTicketId()).append("<br>");
                            // You can add other ticket details here like price, eventId if needed in the email per ticket
                            // ticketsHtmlBuilder.append("<strong>Price:</strong> $").append(String.format("%.2f", ticket.getTicketPrice())).append("<br>");
                            ticketsHtmlBuilder.append("<img src='cid:").append(cid).append("' alt='QR Code for ticket ").append(ticket.getTicketId()).append("' style='width:150px; height:150px; margin-top: 10px;'><br>");
                            ticketsHtmlBuilder.append("</div>");
                            logger.debug("Added QR for ticketId: {} with CID: {}", ticket.getTicketId(), cid);
                        } catch (Exception e) {
                            logger.error("Failed to generate or add inline QR for ticket {}: {}", ticket.getTicketId(), e.getMessage());
                            // Optionally add a placeholder or error message for this specific ticket's QR in the email
                            ticketsHtmlBuilder.append("<div style='margin-bottom: 20px; padding: 10px; border: 1px solid #ddd;'>");
                            ticketsHtmlBuilder.append("<strong>Ticket ID:</strong> ").append(ticket.getTicketId()).append("<br>");
                            ticketsHtmlBuilder.append("<p style='color:red;'>Could not generate QR code for this ticket.</p>");
                            ticketsHtmlBuilder.append("</div>");
                        }
                    }
                }
                // Replace a placeholder in your HTML template with the generated ticketsHtml
                htmlContent = htmlContent.replace("{{ticketDetails}}", ticketsHtmlBuilder.toString());
            } else if (templatePath.contains("booking-confirmation.html")) {
                 // If it's a confirmation but no tickets, or an error occurred before this point
                htmlContent = htmlContent.replace("{{ticketDetails}}", "<p>Your ticket details will be shown here. If you don't see them, please contact support.</p>");
            }


            helper.setText(htmlContent, true);

            // Attach logo image
            try {
                ClassPathResource logo = new ClassPathResource("EventureLogo.jpeg");
                helper.addInline("logo", logo);
                logger.info("Logo attachment successful");
            } catch (Exception e) {
                logger.error("Failed to attach logo: {}", e.getMessage());
                // Continue without logo if it fails
            }

            mailSender.send(message);
            logger.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            throw e;
        }
    }

    private String loadTemplate(String templatePath, Map<String, String> variables) throws Exception {
        try {
            ClassPathResource resource = new ClassPathResource(templatePath);
            String content = new String(Files.readAllBytes(resource.getFile().toPath()), StandardCharsets.UTF_8);
            for (Map.Entry<String, String> entry : variables.entrySet()) {
                content = content.replace("{{" + entry.getKey() + "}}", entry.getValue());
            }
            return content;
        } catch (Exception e) {
            logger.error("Failed to load email template {}: {}", templatePath, e.getMessage());
            throw e;
        }
    }
} 