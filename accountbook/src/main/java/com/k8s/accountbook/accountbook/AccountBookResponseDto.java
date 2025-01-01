package com.k8s.accountbook.accountbook;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;


public class AccountBookResponseDto {



    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class abResponseDto{
        private String expense;
        private Integer money;
        private LocalDate date;
        private String receiptDirectory;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OcrResponseDto{
        private String receiptDirectory;
        private Integer money;
    }
}
