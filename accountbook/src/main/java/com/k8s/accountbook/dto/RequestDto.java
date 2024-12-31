package com.k8s.accountbook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;


public class RequestDto {


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignUpDto{
        private String id;
        private String password;
        private String name;

    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignInDto{
        private String id;
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AbDto{
        private Long userId;
        private String expense;
        private LocalDate date;
        private Integer money;
        private String receiptDirectory;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceiptDto{
        private String receiptDirectory;
    }

}
