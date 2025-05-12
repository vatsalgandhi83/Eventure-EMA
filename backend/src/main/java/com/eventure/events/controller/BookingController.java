package com.eventure.events.controller;

import com.eventure.events.Services.BookingService;
import com.eventure.events.dto.BookingRequest;
import com.eventure.events.dto.BookingResponse;
import com.eventure.events.dto.CancelBookingRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import java.io.IOException;

@RestController
@RequestMapping(value = "/api")
public class BookingController {

    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/bookEvent")
    public ResponseEntity<BookingResponse> bookEvent(@RequestBody BookingRequest request) {
        BookingResponse response = bookingService.bookEvent(request);
        return ResponseEntity.ok(response);
    }

  /*   @PostMapping("/cancelBooking")
    public ResponseEntity<String> cancelBooking(
            @RequestParam(required = true) String id,
            @RequestParam(required = false) String userId) {
        String message = bookingService.cancelBooking(id, userId);
        return ResponseEntity.ok(message);
    }*/

    @PostMapping("/cancelBooking")
    public ResponseEntity<String> cancelBooking(@RequestBody CancelBookingRequest request) {
        String message = bookingService.cancelBooking(request.getBookingId(), request.getUserId());
        return ResponseEntity.ok(message);
    }

    @GetMapping("/getBookingDetails")
    public ResponseEntity<BookingResponse> getBookingDetails(@RequestParam String bookingId, @RequestParam String userId) {
        BookingResponse response = bookingService.getBookingDetailsWithQrCodes(bookingId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/booking/{bookingId}/generatePdf")
    public ResponseEntity<ByteArrayResource> generatePdf(
        @PathVariable String bookingId,
        @RequestParam String requestingUserId
    ) throws IOException {
        ByteArrayResource resource = bookingService.generatePdf(bookingId, requestingUserId);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .body(resource);
    }

}
