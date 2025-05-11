package com.eventure.events.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;
import java.util.Date;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MyException.class)
	public ResponseEntity<?> handleMyException(MyException ex) {
		Map<String, Object> error = new HashMap<>();
		error.put("message", ex.getMessage());
		error.put("timestamp", new Date());
		error.put("status", 400);
		return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
	}

}
