package com.k8s.accountbook.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
@AllArgsConstructor
public class ResponseDto<T> {

    private final HttpStatus httpStatus;
    private final String resultMessage;
    private T resultData;

    public static <T> ResponseDto<T> ok(T result){
        return new ResponseDto<>(HttpStatus.OK, "Success", result);
    }

    public static <T> ResponseDto<T> fail(T result){
        return new ResponseDto<>(HttpStatus.NOT_FOUND, "Fail", result);
    }
}
