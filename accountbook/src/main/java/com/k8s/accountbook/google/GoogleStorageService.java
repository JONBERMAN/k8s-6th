package com.k8s.accountbook.google;

import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
public class GoogleStorageService {

    @Value("${cloud.google.storage.bucket.name}")
    String bucketName;

    private static final Storage storage = StorageOptions.getDefaultInstance().getService();

    public String upload(MultipartFile file) {
        try {
            log.info("file name: {}", file.getOriginalFilename());

            String uuidFilname = setFilename(file.getOriginalFilename());

            BlobInfo blobInfo = storage.create(
                    BlobInfo.newBuilder(bucketName, uuidFilname).build(),
                    file.getBytes()
            );
            log.info("blobInfo.getMediaLink(): {}", blobInfo.getMediaLink());
            return uuidFilname;
        } catch (IllegalStateException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    public String setFilename(String originalFilename){
        UUID uuid = UUID.randomUUID();


        return uuid.toString() + "_" + originalFilename;
    }
}