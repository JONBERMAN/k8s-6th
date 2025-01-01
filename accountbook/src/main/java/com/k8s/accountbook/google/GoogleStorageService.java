package com.k8s.accountbook.google;

import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@Component
public class GoogleStorageService {

    @Value("${cloud.google.storage.bucket.name}")
    String bucketName;

    private static final Storage storage = StorageOptions.getDefaultInstance().getService();

    public String upload(MultipartFile file) {
        try {
            log.info("file name: {}", file.getOriginalFilename());
            BlobInfo blobInfo = storage.create(
                    BlobInfo.newBuilder(bucketName, file.getOriginalFilename()).build(),
                    file.getBytes()
            );
            return blobInfo.getMediaLink();
        } catch (IllegalStateException | IOException e) {
            throw new RuntimeException(e);
        }
    }
}