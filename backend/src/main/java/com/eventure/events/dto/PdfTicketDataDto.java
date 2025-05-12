package com.eventure.events.dto;

import com.eventure.events.model.BookingDetails;
import com.eventure.events.model.Events;
import com.eventure.events.model.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PdfTicketDataDto {
    private BookingDetails booking;
    private Events event;
    private Users user;
}