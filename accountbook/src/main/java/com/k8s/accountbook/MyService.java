package com.k8s.accountbook;


import com.k8s.accountbook.accountbook.AccountBook;
import com.k8s.accountbook.accountbook.AccountBookRepository;
import com.k8s.accountbook.user.User;
import com.k8s.accountbook.user.UserRepository;
import com.k8s.accountbook.google.GoogleOcrService;
import com.k8s.accountbook.user.UserResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MyService {

    private final UserRepository userRepository;
    private final AccountBookRepository accountBookRepository;
    private final GoogleOcrService googleOcrService;



    public Boolean signUp(String identity, String password, String name){

        if (userRepository.existsByIdentity(identity)) {
            return false;
        }
        else {
            User user = User.builder()
                    .identity(identity)
                    .password(password)
                    .name(name)
                    .build();

            userRepository.save(user);
            return true;
        }
    }

    public UserResponseDto.LoginResponse signIn(String id, String password){
        User findUser = userRepository.findByIdentityAndPassword(id, password);

        if (findUser != null) {
            log.info("로그인 성공!!!");
            return new UserResponseDto.LoginResponse(findUser.getId(), findUser.getName());
        } else  {
            log.info("로그인 실패...");
            return new UserResponseDto.LoginResponse(-1L, null);
        }
    }

    //public List<Map.Entry<String, Integer>> getTextFromReceipt(String filePath) throws IOException {
    public void getTextFromReceipt(String filePath) throws IOException {

        googleOcrService.detectText(filePath);

    }

    public void setAB(Long userId,Integer money, LocalDate date, String expense, String receiptDirectory){
        User findUser = userRepository.findById(userId).orElseThrow();

        AccountBook ab = AccountBook.builder()
                .user(findUser)
                .money(money)
                .date(date)
                .expense(expense)
                .receipt(receiptDirectory)
                .build();

        accountBookRepository.save(ab);
    }

    public User getUser(Long userId){
        User findUser = userRepository.findById(userId).orElseThrow(null);

        return findUser;
    }

    public List<AccountBook> getAccountBook(Long userId){
        List<AccountBook> findAccountBooks = accountBookRepository.findAllByUserId(userId);

        return findAccountBooks;
    }



}
