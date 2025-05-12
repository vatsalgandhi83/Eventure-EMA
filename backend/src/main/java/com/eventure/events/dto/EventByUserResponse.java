package com.eventure.events.dto;

import com.eventure.events.model.BookingDetails;
import com.eventure.events.model.Events;
import com.eventure.events.model.Users;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventByUserResponse {
    private BookingDetails booking;
    private Events event;
}