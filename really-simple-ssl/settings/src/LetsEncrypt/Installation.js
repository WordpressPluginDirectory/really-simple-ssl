import { __ } from '@wordpress/i18n';
import * as rsssl_api from "../utils/api";
import {dispatch,} from '@wordpress/data';
import {useEffect, useState} from '@wordpress/element';
import sleeper from "../utils/sleeper";
import useFields from "../Settings/FieldsData";

const Installation = (props) => {
    const {addHelpNotice} = useFields();

    const [installationData, setInstallationData] = useState(false);
    let action = props.action;

     useEffect(()=> {
        if ((action && action.status==='warning' && installationData && installationData.generated_by_rsssl )) {
            addHelpNotice(
                props.field.id,
                 'default',
                 __("This is the certificate, which you need to install in your hosting dashboard.", "really-simple-ssl"),
                 __("Certificate (CRT)", "really-simple-ssl")
              );

              addHelpNotice(
                props.field.id,
                 'default',
                 __("The private key can be uploaded or pasted in the appropriate field on your hosting dashboard.", "really-simple-ssl"),
                 __("Private Key (KEY)", "really-simple-ssl")
              );

              addHelpNotice(
                props.field.id,
                 'default',
                 __("The CA Bundle will sometimes be automatically detected. If not, you can use this file.", "really-simple-ssl"),
                 __("Certificate Authority Bundle (CABUNDLE)", "really-simple-ssl")
              );
        }

        if ( action && (action.status==='error' || action.status === 'warning') ) {
            rsssl_api.runLetsEncryptTest('installation_data').then( ( response ) => {
                if (response) {
                    setInstallationData(response.output);
                }
            });
        }

     }, [action]);


    const handleCopyAction = (type) => {
        let success;
        let data = document.querySelector('.rsssl-'+type).innerText;

        const el = document.createElement('textarea');
        el.value = data;	//str is your string to copy
        document.body.appendChild(el);
        el.select();
        try {
            success = document.execCommand("copy");
        } catch (e) {
            success = false;
        }
        document.body.removeChild(el);
        const notice = dispatch('core/notices').createNotice(
            'success',
            __( 'Copied!', 'really-simple-ssl' ),
            {
                __unstableHTML: true,
                id: 'rsssl_copied_data',
                type: 'snackbar',
                isDismissible: true,
            }
        ).then(sleeper(3000)).then(( response ) => {
            dispatch('core/notices').removeNotice('rsssl_copied_data');
        });
    }

    if ( !action ) {
        return (<></>);
    }


    if (!installationData) {
        return (<></>);
    }
    return (
        <div className="rsssl-test-results">
            { !installationData.generated_by_rsssl && <>{__("The certificate is not generated by Really Simple Security, so there are no installation files here","really-simple-ssl")}</>}

            { installationData.generated_by_rsssl && action.status === 'warning' &&
                <>
                <h4>{ __("Next step", "really-simple-ssl") }</h4>
                    <div className="rsssl-template-intro">{ __("Install your certificate.", "really-simple-ssl")}</div>
                    <h4>{ __("Certificate (CRT)", "really-simple-ssl") }</h4>
                    <div className="rsssl-certificate-data rsssl-certificate" id="rsssl-certificate">{installationData.certificate_content}</div>
                    <a href={installationData.download_url+"&type=certificate"} className="button button-secondary">{ __("Download", "really-simple-ssl")}</a>
                    <button type="button" onClick={(e) => handleCopyAction('certificate')} className="button button-primary">{ __("Copy content", "really-simple-ssl")}</button>

                    <h4>{ __("Private Key (KEY)", "really-simple-ssl") }</h4>
                    <div className="rsssl-certificate-data rsssl-key" id="rsssl-key">{installationData.key_content}</div>
                    <a href={installationData.download_url+"&type=private_key"} className="button button-secondary">{ __("Download", "really-simple-ssl")}</a>
                    <button type="button" className="button button-primary" onClick={(e) => handleCopyAction('key')} >{ __("Copy content", "really-simple-ssl")}</button>
                    <h4>{ __("Certificate Authority Bundle (CABUNDLE)", "really-simple-ssl") }</h4>
                    <div className="rsssl-certificate-data rsssl-cabundle" id="rsssl-cabundle">{installationData.ca_bundle_content}</div>
                    <a href={installationData.download_url+"&type=intermediate"} className="button button-secondary">{ __("Download", "really-simple-ssl")}</a>
                    <button type="button" className="button button-primary" onClick={(e) => handleCopyAction('cabundle')} >{ __("Copy content", "really-simple-ssl")}</button>
                </>
             }
         </div>
    )
}

export default Installation;