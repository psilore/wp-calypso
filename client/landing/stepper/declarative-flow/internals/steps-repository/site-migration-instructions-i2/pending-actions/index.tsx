import { Spinner } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { FC } from 'react';
import './style.scss';

interface VisualStateIndicatorProps {
	state: 'idle' | 'pending' | 'success' | 'error';
	text: string;
}

const VisualStateIndicator = ( { state, text }: VisualStateIndicatorProps ) => {
	let icon: string | JSX.Element;
	switch ( state ) {
		case 'pending':
			icon = <Spinner />;
			break;
		case 'success':
			icon = <Icon icon={ check } width={ 20 } />;
			break;
		case 'error':
			icon = '❌';
			break;
		default:
			icon = '';
			break;
	}
	return (
		<span className="pending-actions__action">
			{ state === 'pending' && <em>{ text }</em> }
			{ state !== 'pending' && text }
			<span className="pending-actions__action--icon">{ icon }</span>
		</span>
	);
};

type Status = 'idle' | 'pending' | 'success' | 'error';
interface Props {
	status?: {
		siteTransfer: Status;
		pluginInstallation: Status;
		migrationKey: Status;
	};
}

export const PendingActions: FC< Props > = ( { status }: Props ) => {
	const { siteTransfer, pluginInstallation, migrationKey } = status || {};
	const allIdle = [ siteTransfer, pluginInstallation, migrationKey ].every( ( s ) => s === 'idle' );

	return (
		<div className="pending-actions">
			<span>
				{ translate( 'Wait until we finish setting up your site to continue' ) }
				{ allIdle && <Spinner /> }
			</span>
			<ul className="pending-actions__list">
				{ ! [ 'idle' ].includes( siteTransfer! ) && (
					<li
						className={ classNames( 'fade-in', {
							active: siteTransfer !== 'idle',
						} ) }
					>
						<VisualStateIndicator
							state={ siteTransfer! }
							text={ translate( 'Creating your site' ) }
						/>
					</li>
				) }
				<li
					className={ classNames( 'fade-in', {
						active: pluginInstallation !== 'idle',
					} ) }
				>
					<VisualStateIndicator
						state={ pluginInstallation! }
						text={ translate( 'Installing the required plugins' ) }
					/>
				</li>
				{ migrationKey !== 'error' && (
					<li
						className={ classNames( 'fade-in', {
							active: migrationKey !== 'idle',
						} ) }
					>
						<VisualStateIndicator
							state={ migrationKey! }
							text={ translate( 'Getting the migration key' ) }
						/>
					</li>
				) }
			</ul>
		</div>
	);
};
