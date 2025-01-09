package com.k8s.accountbook.google;


import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;


import java.io.FileInputStream;
import java.io.IOException;

import java.util.ArrayList;
import java.util.List;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOcrService {



    public void detectText() throws IOException {
        // TODO(developer): Replace these variables before running the sample.
        String filePath = "path/to/your/image/file.jpg";
        detectText(filePath);
    }

    // Detects text in the specified image.
    public Integer detectText(String filePath) throws IOException {
        List<AnnotateImageRequest> requests = new ArrayList<>();

        ByteString imgBytes = ByteString.readFrom(new FileInputStream(filePath));

        Image img = Image.newBuilder().setContent(imgBytes).build();
        Feature feat = Feature.newBuilder().setType(Feature.Type.TEXT_DETECTION).build();
        AnnotateImageRequest request =
                AnnotateImageRequest.newBuilder().addFeatures(feat).setImage(img).build();
        requests.add(request);

        ArrayList<String> result = new ArrayList<>();

        // Initialize client that will be used to send requests. This client only needs to be created
        // once, and can be reused for multiple requests. After completing all of your requests, call
        // the "close" method on the client to safely clean up any remaining background resources.
        try (ImageAnnotatorClient client = ImageAnnotatorClient.create()) {
            BatchAnnotateImagesResponse response = client.batchAnnotateImages(requests);
            List<AnnotateImageResponse> responses = response.getResponsesList();

            for (AnnotateImageResponse res : responses) {
                if (res.hasError()) {
                    System.out.format("Error: %s%n", res.getError().getMessage());
                    return -1;
                }

                int i = 0;

                // For full list of available annotations, see http://g.co/cloud/vision/docs
                for (EntityAnnotation annotation : res.getTextAnnotationsList()) {
                    System.out.format("Text: %s%n", annotation.getDescription());
                    //System.out.format("Position : %s%n", annotation.getBoundingPoly());
                    System.out.format("Index : %d%n", i++);
                    result.add(annotation.getDescription());
                }
            }
        }

        int price = findMaxAmount(result);

        return price;
    }







    public static int findMaxAmount(List<String> receiptTextList) {
        // 금액을 추출할 정규 표현식: 숫자 1~3자리, 쉼표나 점이 포함된 금액
        String amountPattern = "\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?"; // 쉼표와 점을 포함한 숫자

        // 최대 금액을 추적하는 변수
        int maxAmount = Integer.MIN_VALUE;

        // 문자 리스트 순회
        for (String text : receiptTextList) {
            // 정규 표현식으로 금액을 추출
            Pattern pattern = Pattern.compile(amountPattern);
            Matcher matcher = pattern.matcher(text);

            // 매칭된 금액이 있다면
            while (matcher.find()) {
                String matchedAmount = matcher.group();
                // 쉼표 제거 후 숫자만 남기기
                matchedAmount = matchedAmount.replace(",", "");

                try {
                    // 금액을 정수로 변환
                    int amount = Integer.parseInt(matchedAmount);
                    // 최대 금액 갱신
                    maxAmount = Math.max(maxAmount, amount);
                } catch (NumberFormatException e) {
                    // 예외 처리: 숫자가 아닌 값이 있을 경우 무시
                    continue;
                }
            }
        }

        // 최대 금액 반환
        return maxAmount == Integer.MIN_VALUE ? -1 : maxAmount; // -1은 금액을 찾을 수 없을 때
    }

}