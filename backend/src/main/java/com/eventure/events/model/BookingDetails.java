package com.eventure.events.model;

import com.eventure.events.dto.Ticket;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "BookingDetails")
public class BookingDetails {
    @Id
    private String id;
    private String userId;
    private int ticketCount;
    private double totalTicketPrice;
    private List<Ticket> tickets;
    private String bookingStatus;
}

