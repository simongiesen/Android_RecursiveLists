package com.antoshkaplus.recursivelists.backend.model;


import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;

import java.util.Date;
import java.util.List;
import java.util.UUID;


// going to store everything in one place
@Entity
public class BackendUser {

    @Id
    private String userId;
    private int version;
    private String rootUuid;

    private Date gtaskLastUpdate;

    public BackendUser() {}

    public BackendUser(String userId) {
        this.version = 0;
        this.userId = userId;
        this.rootUuid = UUID.randomUUID().toString();
        this.gtaskLastUpdate = new Date(0);
    }

    public Key<BackendUser> getKey() {
        return Key.create(BackendUser.class, userId);
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public int increaseVersion() { return ++version; }

    public String getRootUuid() {
        return rootUuid;
    }

    public void setRootUuid(String rootId) {
        this.rootUuid = rootId;
    }

    public Date getGtaskLastUpdate() {
        return gtaskLastUpdate;
    }

    public void setGtaskLastUpdate(Date googleTaskLastUpdate) {
        this.gtaskLastUpdate = googleTaskLastUpdate;
    }
}