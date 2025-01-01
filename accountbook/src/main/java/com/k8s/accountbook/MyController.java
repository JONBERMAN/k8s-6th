package com.k8s.accountbook;

import com.k8s.accountbook.accountbook.AccountBook;
import com.k8s.accountbook.accountbook.AccountBookResponseDto;
import com.k8s.accountbook.dto.RequestDto;
import com.k8s.accountbook.dto.ResponseDto;
import com.k8s.accountbook.google.GoogleOcrService;
import com.k8s.accountbook.user.UserResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/k8s")
@RequiredArgsConstructor
public class MyController {

    private final MyService myService;
    private final GoogleOcrService googleOcrService;

    // 회원가입
    @PostMapping("/user/signup")
    public ResponseDto<String> signUp(@RequestBody RequestDto.SignUpDto signUpDto){

        Boolean ok = myService.signUp(signUpDto.getId(), signUpDto.getPassword(), signUpDto.getName());

        if (ok){

            return ResponseDto.ok("회원 가입 성공");
        }
        else {
            return ResponseDto.fail("사용할 수 없는 아이디 입니다.");
        }
    }

    // 로그인
    @PostMapping("/user/signin")
    public ResponseDto<UserResponseDto.LoginResponse> signIn(@RequestBody RequestDto.SignInDto signInDto){

        UserResponseDto.LoginResponse response = myService.signIn(signInDto.getId(), signInDto.getPassword());

        return ResponseDto.ok(response);
    }



    // 회원 가계부 조회.
    @GetMapping("/accountbook/{userId}")
    public ResponseDto<List<AccountBookResponseDto.abResponseDto>> getAccountBook(@PathVariable Long userId){

        List<AccountBook> findAB = myService.getAccountBook(userId);

        List<AccountBookResponseDto.abResponseDto> abResponseDtoList = findAB.stream().map(ab -> {
            return AccountBookResponseDto.abResponseDto.builder()
                    .expense(ab.getExpense())
                    .money(ab.getMoney())
                    .date(ab.getDate())
                    .receiptDirectory(ab.getReceipt())
                    .build();
        }).toList();

        return ResponseDto.ok(abResponseDtoList);
    }


    // 가계부 직접 등록
    @PostMapping("/accountbook")
    public ResponseDto<String> setAccountBook(@RequestBody RequestDto.AbDto abDto){

        myService.setAB(abDto.getUserId() ,abDto.getMoney(), abDto.getDate(), abDto.getExpense(), abDto.getReceiptDirectory());

        return ResponseDto.ok("가계부 등록.");
    }



    // ocr 영수증 등록
    @PostMapping("/accountbook/ocr")
    public ResponseDto<Integer> setReceipt(@RequestBody RequestDto.ReceiptDto receiptDto) throws IOException {

        Integer price = googleOcrService.detectText(receiptDto.getReceiptDirectory());

        return ResponseDto.ok(price);
    }

//    @PostMapping("/accountbook/ocr")
//    public ResponseDto<AccountBookResponseDto.OcrResponseDto> setReceipt(@RequestPart("receipt") MultipartFile file) throws IOException {
//
//        //Integer price = googleOcrService.detectText(receiptDto.getReceiptDirectory());
//
//        String filename = "googleStorageService.upload(file)";
//        Map.Entry<String, Integer> result = googleOcrService.detectTextGcs(file);
//
//        return ResponseDto.ok(new AccountBookResponseDto.OcrResponseDto(result.getKey() ,result.getValue()));
//    }

}
