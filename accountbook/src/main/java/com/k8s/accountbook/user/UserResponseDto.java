package com.k8s.accountbook.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


public class UserResponseDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfoResponse{
        private String name;
    }
}
