package com.k8s.accountbook.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


public class UserResponseDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponse{
        private Long userId;
        private String name;
    }
}
